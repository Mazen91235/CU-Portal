import { useCallback, useRef } from "react";
import { useSearchParams } from "react-router";
import type { SetStateAction } from "react";

const areSearchParamsEqual = (left: URLSearchParams, right: URLSearchParams) =>
    left.toString() === right.toString();

export const useFilterSearchParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsRef = useRef(searchParams);
    const setterCache = useRef(
        new Map<string, (value: SetStateAction<string>) => void>(),
    );

    searchParamsRef.current = searchParams;

    const updateSearchParams = useCallback(
        (
            buildNext: (current: URLSearchParams) => URLSearchParams,
            replace = false,
        ) => {
            const current = searchParamsRef.current;
            const next = buildNext(new URLSearchParams(current));
            if (areSearchParamsEqual(current, next)) return;

            searchParamsRef.current = next;
            setSearchParams(next, { replace });
        },
        [setSearchParams],
    );

    const getFilter = useCallback(
        (key: string, fallback = "") =>
            searchParams.has(key) ? searchParams.get(key) ?? "" : fallback,
        [searchParams],
    );

    const setFilter = useCallback(
        (key: string, value: string, keepEmpty = false) => {
            updateSearchParams((current) => {
                if (value || keepEmpty) current.set(key, value);
                else current.delete(key);
                return current;
            });
        },
        [updateSearchParams],
    );

    const getFilterSetter = useCallback(
        (key: string, keepEmpty = false) => {
            const cacheKey = `${key}:${keepEmpty ? "keep" : "drop"}`;
            const cached = setterCache.current.get(cacheKey);
            if (cached) return cached;

            const setter = (value: SetStateAction<string>) => {
                updateSearchParams((current) => {
                    const currentValue = current.get(key) ?? "";
                    const nextValue =
                        typeof value === "function"
                            ? value(currentValue)
                            : value;
                    if (nextValue || keepEmpty) current.set(key, nextValue);
                    else current.delete(key);
                    return current;
                });
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
