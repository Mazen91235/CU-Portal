import { fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { maxRetries, retryCondition } from "./APIHandling";

type CustomBaseQuery = BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError,
    object,
    FetchBaseQueryMeta
>;

type CacheEntry = {
    result: unknown;
    expiresAt: number;
};

const GET_CACHE_TTL = 120_000;

const responseCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<unknown>>();

const getRequest = (args: string | FetchArgs) =>
    typeof args === "string" ? { url: args } : args;

const getUrl = (args: string | FetchArgs, baseUrl: string) => {
    const request = getRequest(args);
    const requestUrl = /^https?:\/\//i.test(request.url)
        ? request.url
        : `${baseUrl.replace(/\/+$/, "")}/${request.url.replace(/^\/+/, "")}`;
    const url = new URL(requestUrl);

    if (request.params) {
        const params =
            request.params instanceof URLSearchParams
                ? request.params
                : new URLSearchParams(request.params as Record<string, string>);
        params.forEach((value, key) => url.searchParams.append(key, value));
    }

    return url;
};

const serializeBody = (body: unknown) => {
    if (body === undefined) return "";

    if (typeof FormData !== "undefined" && body instanceof FormData) {
        return JSON.stringify(
            Array.from(body.entries()).map(([key, value]) => [
                key,
                typeof File !== "undefined" && value instanceof File
                    ? {
                          name: value.name,
                          size: value.size,
                          type: value.type,
                          lastModified: value.lastModified,
                      }
                    : value,
            ]),
        );
    }

    try {
        return JSON.stringify(body);
    } catch {
        return String(body);
    }
};

const getCacheKey = (args: string | FetchArgs, baseUrl: string) => {
    const request = getRequest(args);
    const url = getUrl(args, baseUrl);
    const path = `${url.origin}${url.pathname}`;
    const search = url.searchParams.toString();
    const requestPath = search ? `${path}?${search}` : path;
    const method = String(request.method || "GET").toUpperCase();

    if (method === "GET") return requestPath;

    return `${method}:${requestPath}:${serializeBody(request.body)}`;
};

const cleanupExpiredCache = () => {
    const now = Date.now();
    responseCache.forEach((entry, key) => {
        if (entry.expiresAt <= now) responseCache.delete(key);
    });
};

const getCachedResponse = (key: string) => {
    const entry = responseCache.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt <= Date.now()) {
        responseCache.delete(key);
        return undefined;
    }

    return entry.result;
};

const cacheResponse = (key: string, result: unknown) => {
    responseCache.set(key, {
        result,
        expiresAt: Date.now() + GET_CACHE_TTL,
    });
};

const invalidateGetCache = (origin?: string) => {
    if (!origin) {
        responseCache.clear();
        return;
    }

    responseCache.forEach((_, key) => {
        if (key.startsWith(origin)) responseCache.delete(key);
    });
};

const nonCacheableGetEndpoints = new Set(["logout", "changeGoogleAccount"]);

export const clearCustomBaseQueryCache = () => {
    invalidateGetCache();
};

export const customBaseQuery = (
    config: Parameters<typeof fetchBaseQuery>[0],
): CustomBaseQuery => {
    const baseQuery = retry(fetchBaseQuery(config), {
        maxRetries,
        //@ts-expect-error RTK Query's types don't account for this parameter
        retryCondition,
    });

    return async (args, api, extraOptions) => {
        cleanupExpiredCache();

        const request = getRequest(args);
        const method = String(request.method || "GET").toUpperCase();
        const key = getCacheKey(args, config?.baseUrl || "");
        const isGetRequest = method === "GET";
        const shouldCache =
            isGetRequest && !nonCacheableGetEndpoints.has(api.endpoint);

        if (shouldCache) {
            const cachedResponse = getCachedResponse(key);
            if (cachedResponse !== undefined) {
                return cachedResponse as Awaited<ReturnType<typeof baseQuery>>;
            }
        }

        const existingRequest = inFlightRequests.get(key);
        if (existingRequest) {
            return (await existingRequest) as Awaited<
                ReturnType<typeof baseQuery>
            >;
        }

        const requestPromise = baseQuery(args, api, extraOptions);
        inFlightRequests.set(key, requestPromise as Promise<unknown>);

        try {
            const result = await requestPromise;

            if (!("error" in result)) {
                if (shouldCache) cacheResponse(key, result);
                else
                    invalidateGetCache(
                        getUrl(args, config?.baseUrl || "").origin,
                    );
            }

            return result;
        } finally {
            inFlightRequests.delete(key);
        }
    };
};
