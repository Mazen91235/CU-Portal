import { useCallback, useEffect, useRef } from "react";
import { useLoading } from "../contexts/hooks/useLoading";
import { useLocation } from "react-router";

export const usePageLoading = (
    execute: boolean = false,
    callback?: () => void,
) => {
    const cleanupRef = useRef<(() => void) | null>(null);
    const location = useLocation();
    const oldLocationRef = useRef(location);
    const { setLoading, clearLoading } = useLoading();
    useEffect(() => {
        if (location !== oldLocationRef.current) {
            oldLocationRef.current = location;
            setLoading();
        }
        if (document.readyState !== "complete") setLoading();
    }, [location, setLoading]); // Set loading on location change
    const startPageLoading = useCallback(
        (callback?: () => void) => {
            const handleLoaded = () => {
                clearLoading();
                document.removeEventListener("readystatechange", handleLoaded);
                if (callback) callback();
            };

            if (document.readyState === "complete") {
                handleLoaded();
                cleanupRef.current = null;
            } else {
                document.addEventListener("readystatechange", handleLoaded);
                cleanupRef.current = () => {
                    document.removeEventListener(
                        "readystatechange",
                        handleLoaded,
                    );
                };
            }
        },
        [clearLoading],
    );

    // Cleanup on unmount
    useEffect(() => {
        if (execute) startPageLoading(callback);
        return () => {
            if (cleanupRef.current) cleanupRef.current();
        };
    }, [execute, startPageLoading, callback]);
    return startPageLoading;
};
