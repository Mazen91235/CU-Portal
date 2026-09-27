import { useCallback, useEffect, useRef } from "react";
import { useLoading } from "../contexts/hooks/useLoading";
import { useLocation } from "react-router";

export const usePageLoading = (
    execute: boolean = false,
    callback?: () => void,
) => {
    const cleanupRef = useRef<(() => void) | null>(null);
    const { pathname } = useLocation();
    const { startLoading } = useLoading();

    const startPageLoading = useCallback(
        (cb?: () => void) => {
            cleanupRef.current?.();
            cleanupRef.current = null;

            const releaseLoading = startLoading();
            let handled = false;

            const release = () => {
                if (handled) return false;
                handled = true;
                document.removeEventListener("readystatechange", handleLoaded);
                releaseLoading();
                cleanupRef.current = null;
                return true;
            };

            const handleLoaded = () => {
                if (release()) cb?.();
            };

            if (document.readyState === "complete") {
                handleLoaded();
            } else {
                document.addEventListener("readystatechange", handleLoaded);
                cleanupRef.current = () => {
                    release();
                };
            }
        },
        [startLoading],
    );

    useEffect(() => {
        if (execute) startPageLoading(callback);

        return () => {
            cleanupRef.current?.();
            cleanupRef.current = null;
        };
    }, [pathname, execute, startPageLoading]);

    return startPageLoading;
};
