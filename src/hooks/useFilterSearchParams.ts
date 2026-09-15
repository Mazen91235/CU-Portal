import { useCallback } from "react";
import { useSearchParams } from "react-router";
import type { SetStateAction } from "react";

export const useFilterSearchParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const getFilter = useCallback(
        (key: string, fallback = "") =>
            searchParams.has(key) ? searchParams.get(key) ?? "" : fallback,
        [searchParams],
    );

    const setFilter = useCallback(
        (key: string, value: string, keepEmpty = false) => {
            const next = new URLSearchParams(searchParams);
            if (value || keepEmpty) next.set(key, value);
            else next.delete(key);
            setSearchParams(next);
        },
        [searchParams, setSearchParams],
    );

    const getFilterSetter = useCallback(
        (key: string, keepEmpty = false) =>
            (value: SetStateAction<string>) => {
                const current = searchParams.get(key) ?? "";
                const nextValue =
                    typeof value === "function" ? value(current) : value;
                setFilter(key, nextValue, keepEmpty);
            },
        [searchParams, setFilter],
    );

    const setFilters = useCallback(
        (updates: Record<string, string | null | undefined>, replace = false) => {
            const next = new URLSearchParams(searchParams);
            Object.entries(updates).forEach(([key, value]) => {
                if (value) next.set(key, value);
                else next.delete(key);
            });
            setSearchParams(next, { replace });
        },
        [searchParams, setSearchParams],
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
