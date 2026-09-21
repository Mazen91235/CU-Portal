import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import type { SetStateAction } from "react";

type FilterSetter = (
    value: SetStateAction<string>,
    replace?: boolean,
) => void;

type PendingNavigation = {
    searchParams: URLSearchParams;
    replace: boolean;
};

const areSearchParamsEqual = (left: URLSearchParams, right: URLSearchParams) =>
    left.toString() === right.toString();

export const useFilterSearchParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsRef = useRef(searchParams);
    const pendingNavigationsRef = useRef<PendingNavigation[]>([]);
    const navigationInFlightRef = useRef(false);
    const setterCache = useRef(new Map<string, FilterSetter>());

    if (pendingNavigationsRef.current.length === 0) {
        searchParamsRef.current = searchParams;
    }

    const startNextNavigation = useCallback(() => {
        if (navigationInFlightRef.current) return;

        const nextNavigation = pendingNavigationsRef.current[0];
        if (!nextNavigation) return;

        navigationInFlightRef.current = true;
        setSearchParams(nextNavigation.searchParams, {
            replace: nextNavigation.replace,
        });
    }, [setSearchParams]);

    useEffect(() => {
        const current = new URLSearchParams(searchParams);
        searchParamsRef.current = current;

        const pending = pendingNavigationsRef.current;
        if (pending.length === 0) {
            navigationInFlightRef.current = false;
            return;
        }

        const inFlight = pending[0];
        if (!areSearchParamsEqual(current, inFlight.searchParams)) {
            pendingNavigationsRef.current = [];
            navigationInFlightRef.current = false;
            return;
        }

        pending.shift();
        navigationInFlightRef.current = false;
        startNextNavigation();
    }, [searchParams, startNextNavigation]);

    const updateSearchParams = useCallback(
        (
            buildNext: (current: URLSearchParams) => URLSearchParams,
            replace = false,
        ) => {
            const pending = pendingNavigationsRef.current;
            const current =
                pending.length > 0
                    ? pending[pending.length - 1].searchParams
                    : searchParamsRef.current;
            const next = buildNext(new URLSearchParams(current));

            if (areSearchParamsEqual(current, next)) return;

            pending.push({
                searchParams: next,
                replace,
            });

            startNextNavigation();
        },
        [startNextNavigation],
    );

    const getFilter = useCallback(
        (key: string, fallback = "") =>
            searchParams.has(key) ? searchParams.get(key) ?? "" : fallback,
        [searchParams],
    );

    const setFilter = useCallback(
        (
            key: string,
            value: string,
            keepEmpty = false,
            replace = false,
        ) => {
            updateSearchParams((current) => {
                if (value || keepEmpty) current.set(key, value);
                else current.delete(key);
                return current;
            }, replace);
        },
        [updateSearchParams],
    );

    const getFilterSetter = useCallback(
        (key: string, keepEmpty = false): FilterSetter => {
            const cacheKey = `${key}:${keepEmpty ? "keep" : "drop"}`;
            const cached = setterCache.current.get(cacheKey);
            if (cached) return cached;

            const setter: FilterSetter = (value, replace = false) => {
                updateSearchParams((current) => {
                    const currentValue = current.get(key) ?? "";
                    const nextValue =
                        typeof value === "function"
                            ? value(currentValue)
                            : value;
                    if (nextValue || keepEmpty) current.set(key, nextValue);
                    else current.delete(key);
                    return current;
                }, replace);
            };

            setterCache.current.set(cacheKey, setter);
            return setter;
        },
        [updateSearchParams],
    );

    const setFilters = useCallback(
        (
            updates: Record<string, string | null | undefined>,
            replace = false,
        ) => {
            updateSearchParams((current) => {
                Object.entries(updates).forEach(([key, value]) => {
                    if (value) current.set(key, value);
                    else current.delete(key);
                });
                return current;
            }, replace);
        },
        [updateSearchParams],
    );

    return {
        searchParams,
        setSearchParams,
        getFilter,
        setFilter,
        getFilterSetter,
        setFilters,
    };
};

export default useFilterSearchParams;
