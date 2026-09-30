import { fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { getTimeout, mutationTimeout } from "./APIHandling";

type CustomBaseQuery = BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError,
    object,
    FetchBaseQueryMeta
>;

type PersistentCacheEntry = {
    data: unknown;
    expiresAt: number;
    module: string;
};

const GET_CACHE_TTL = 120_000;
const CACHE_STORAGE_PREFIX = "cu-portal-api-cache:";
const CACHE_INVALIDATIONS_STORAGE_KEY = "cu-portal-api-cache-invalidations";

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

const extractModuleFromPath = (path: string) => {
    const module = path.replace(/^\/user\//, "").replace(/^\/admin\//, "");

    if (!module || !module.includes("/")) return "user";
    if (module.includes("auth")) return "auth";

    return module.split("/")[0];
};

const getInvalidatedModules = (module: string) => {
    const modules = new Set([module]);

    if (
        ["task", "exam", "announcement", "event", "note"].some((value) =>
            module.includes(value),
        )
    ) {
        modules.add("calendar");
    }

    if (module.includes("auth")) {
        modules.add("user");
    }

    if (module.includes("material")) {
        modules.add("week");
    }

    return modules;
};

const getCacheStorageKey = (cacheKey: string) =>
    `${CACHE_STORAGE_PREFIX}${encodeURIComponent(cacheKey)}`;

const canUseLocalStorage = () => typeof localStorage !== "undefined";

const removeExpiredCacheEntries = () => {
    if (!canUseLocalStorage()) return;

    const now = Date.now();

    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);
        if (!key || !key.startsWith(CACHE_STORAGE_PREFIX)) continue;

        try {
            const cached = JSON.parse(
                localStorage.getItem(key) || "null",
            ) as Partial<PersistentCacheEntry> | null;
            if (
                !cached ||
                typeof cached.expiresAt !== "number" ||
                cached.expiresAt <= now
            ) {
                localStorage.removeItem(key);
            }
        } catch {
            localStorage.removeItem(key);
        }
    }
};

const readCachedResponse = (cacheKey: string) => {
    if (!canUseLocalStorage()) return undefined;

    const storageKey = getCacheStorageKey(cacheKey);

    try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return undefined;

        const cached = JSON.parse(stored) as PersistentCacheEntry;
        if (
            !cached ||
            typeof cached.expiresAt !== "number" ||
            cached.expiresAt <= Date.now()
        ) {
            localStorage.removeItem(storageKey);
            return undefined;
        }

        return cached;
    } catch {
        localStorage.removeItem(storageKey);
        return undefined;
    }
};

const writeCachedResponse = (
    cacheKey: string,
    data: unknown,
    module: string,
) => {
    if (!canUseLocalStorage()) return;

    const storageKey = getCacheStorageKey(cacheKey);
    const value = JSON.stringify({
        data,
        expiresAt: Date.now() + GET_CACHE_TTL,
        module,
    } satisfies PersistentCacheEntry);

    try {
        localStorage.setItem(storageKey, value);
    } catch {
        removeExpiredCacheEntries();
        try {
            localStorage.setItem(storageKey, value);
        } catch {
            return;
        }
    }
};

const readInvalidationTimes = (): Record<string, number> => {
    if (!canUseLocalStorage()) return {};

    try {
        const stored = localStorage.getItem(CACHE_INVALIDATIONS_STORAGE_KEY);
        if (!stored) return {};

        const parsed = JSON.parse(stored) as Record<string, unknown>;
        return Object.fromEntries(
            Object.entries(parsed).filter(
                ([, value]) => typeof value === "number",
            ),
        ) as Record<string, number>;
    } catch {
        localStorage.removeItem(CACHE_INVALIDATIONS_STORAGE_KEY);
        return {};
    }
};

const getModuleInvalidationTime = (module: string) => {
    const invalidations = readInvalidationTimes();
    return Math.max(invalidations["*"] || 0, invalidations[module] || 0);
};

const normalizeModuleName = (module: string) => {
    module = module.toLocaleLowerCase();
    return module.endsWith("s")
        ? module.substring(0, module.length - 1)
        : module;
};

const invalidateGetCacheByModule = (module: string) => {
    const modules = getInvalidatedModules(module);
    const normalizedModules = new Set([...modules].map(normalizeModuleName));
    const invalidatedAt = Date.now();

    if (!canUseLocalStorage()) return;

    removeExpiredCacheEntries();

    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);
        if (!key || !key.startsWith(CACHE_STORAGE_PREFIX)) continue;

        try {
            const cached = JSON.parse(
                localStorage.getItem(key) || "null",
            ) as Partial<PersistentCacheEntry> | null;
            if (
                cached?.module &&
                normalizedModules.has(normalizeModuleName(cached.module))
            ) {
                localStorage.removeItem(key);
            }
        } catch {
            localStorage.removeItem(key);
        }
    }

    try {
        const invalidations = readInvalidationTimes();
        normalizedModules.forEach((invalidatedModule) => {
            invalidations[invalidatedModule] = invalidatedAt;
        });
        localStorage.setItem(
            CACHE_INVALIDATIONS_STORAGE_KEY,
            JSON.stringify(invalidations),
        );
    } catch {
        return;
    }
};

const clearAllGetCache = () => {
    if (!canUseLocalStorage()) return;

    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);
        if (key?.startsWith(CACHE_STORAGE_PREFIX)) {
            localStorage.removeItem(key);
        }
    }

    try {
        localStorage.setItem(
            CACHE_INVALIDATIONS_STORAGE_KEY,
            JSON.stringify({ "*": Date.now() }),
        );
    } catch {
        localStorage.removeItem(CACHE_INVALIDATIONS_STORAGE_KEY);
    }
};

const getBlobHash = async (blob: Blob) => {
    try {
        if (typeof crypto === "undefined" || !crypto.subtle) return "";

        const digest = await crypto.subtle.digest(
            "SHA-256",
            await blob.arrayBuffer(),
        );
        return Array.from(new Uint8Array(digest))
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    } catch {
        return "";
    }
};

const serializeBody = async (body: unknown): Promise<string> => {
    if (body === undefined) return "";

    if (typeof FormData !== "undefined" && body instanceof FormData) {
        const entries: Array<[string, FormDataEntryValue]> = [];
        body.forEach((value, key) => entries.push([key, value]));

        const serializedEntries: unknown[] = [];
        for (const [key, value] of entries) {
            if (typeof File !== "undefined" && value instanceof File) {
                serializedEntries.push([
                    key,
                    {
                        name: value.name,
                        size: value.size,
                        type: value.type,
                        lastModified: value.lastModified,
                        hash: await getBlobHash(value),
                    },
                ]);
                continue;
            }

            if (typeof Blob !== "undefined" && value instanceof Blob) {
                serializedEntries.push([
                    key,
                    {
                        size: value.size,
                        type: value.type,
                        hash: await getBlobHash(value),
                    },
                ]);
                continue;
            }

            serializedEntries.push([key, value]);
        }

        return JSON.stringify(serializedEntries);
    }

    if (typeof Blob !== "undefined" && body instanceof Blob) {
        return JSON.stringify({
            size: body.size,
            type: body.type,
            hash: await getBlobHash(body),
        });
    }

    try {
        return JSON.stringify(body);
    } catch {
        return String(body);
    }
};

const getCacheKey = async (args: string | FetchArgs, baseUrl: string) => {
    const request = getRequest(args);
    const url = getUrl(args, baseUrl);
    const requestPath = `${url.pathname}${url.search}`;
    const method = String(request.method || "GET").toUpperCase();

    if (method === "GET") return requestPath;

    return `${method}:${requestPath}:${await serializeBody(request.body)}`;
};

const nonCacheableGetEndpoints = new Set([
    "logout",
    "changeGoogleAccount",
    "getTokenDetails",
]);

export const clearCustomBaseQueryCache = () => {
    clearAllGetCache();
};

const MAX_RETRIES = 4;

const retryCondition = (
    error: unknown,
    _args: unknown,
    { attempt }: { attempt: number },
) => {
    const status =
        typeof error === "object" && error !== null && "status" in error
            ? (error as { status?: unknown }).status
            : undefined;

    const isNetworkError = status === "FETCH_ERROR";
    const isRetryableServerError = status === 502 || status === 503;

    return (isNetworkError || isRetryableServerError) && attempt < MAX_RETRIES;
};

const isGoogleDriveRequest = (url: URL) =>
    url.hostname.endsWith("googleapis.com") && url.pathname.includes("/drive/");

export const invalidateCustomBaseQueryCacheByUrl = (url: string) => {
    if (!url || typeof window === "undefined") return;

    try {
        const parsedUrl = new URL(url, window.location.origin);
        const apiOrigin = new URL(import.meta.env.VITE_API_URL).origin;
        if (
            parsedUrl.origin !== window.location.origin &&
            parsedUrl.origin !== apiOrigin
        )
            return;
        invalidateGetCacheByModule(extractModuleFromPath(parsedUrl.pathname));
    } catch {
        return;
    }
};

export const customBaseQuery = (
    config: Parameters<typeof fetchBaseQuery>[0],
): CustomBaseQuery => {
    const baseQuery = retry(fetchBaseQuery(config), {
        maxRetries: MAX_RETRIES,
        //@ts-expect-error RTK Query's types don't account for this parameter
        retryCondition,
    });

    return async (args, api, extraOptions) => {
        removeExpiredCacheEntries();

        const request = getRequest(args);
        const method = String(request.method || "GET").toUpperCase();
        const isGetRequest = method === "GET";
        const shouldCache =
            isGetRequest && !nonCacheableGetEndpoints.has(api.endpoint);
        const cacheKey = await getCacheKey(args, config?.baseUrl || "");
        const requestUrl = getUrl(args, config?.baseUrl || "");
        const module = extractModuleFromPath(requestUrl.pathname);
        const invalidationTimeAtStart = getModuleInvalidationTime(module);

        if (shouldCache) {
            const cachedResponse = readCachedResponse(cacheKey);
            if (cachedResponse) {
                return {
                    data: cachedResponse.data,
                } as Awaited<ReturnType<typeof baseQuery>>;
            }
        }

        const existingRequest = inFlightRequests.get(cacheKey);
        if (existingRequest) {
            return (await existingRequest) as Awaited<
                ReturnType<typeof baseQuery>
            >;
        }

        const requestWithTimeout = isGoogleDriveRequest(requestUrl)
            ? request
            : {
                  ...request,
                  timeout: isGetRequest ? getTimeout : mutationTimeout,
              };

        const requestPromise = baseQuery(requestWithTimeout, api, extraOptions);
        inFlightRequests.set(cacheKey, requestPromise as Promise<unknown>);

        try {
            const result = await requestPromise;

            if (!("error" in result)) {
                if (
                    shouldCache &&
                    getModuleInvalidationTime(module) ===
                        invalidationTimeAtStart
                ) {
                    writeCachedResponse(cacheKey, result.data, module);
                } else if (!isGetRequest) {
                    invalidateGetCacheByModule(module);
                } else if (api.endpoint === "logout") {
                    clearAllGetCache();
                } else if (api.endpoint === "changeGoogleAccount") {
                    invalidateGetCacheByModule("user");
                }
            }

            return result;
        } finally {
            inFlightRequests.delete(cacheKey);
        }
    };
};
