import { useCallback, useEffect } from "react";
import { useLoading } from "../contexts/hooks/useLoading";
import { useLocation } from "react-router";

export const usePageLoading = (
    execute: boolean = false,
    callback?: () => void,
) => {
    const { pathname } = useLocation();
    const { startLoading } = useLoading();

    const startPageLoading = useCallback(
        (cb?: () => void) => {
            const releaseLoading = startLoading();
            let released = false;

            const release = (callCallback: boolean = false) => {
                if (released) return false;
                released = true;

                window.removeEventListener("load", handleLoaded);
                releaseLoading();

                if (callCallback) cb?.();
                return true;
            };

            const handleLoaded = () => {
                if (document.readyState === "complete") {
                    release(true);
                }
            };

            if (document.readyState === "complete") {
                release(true);
            } else {
                window.addEventListener("load", handleLoaded, { once: true });
            }

            return () => {
                release();
            };
        },
        [startLoading],
    );

    useEffect(() => {
        if (!execute) return;

        return startPageLoading(callback);
    }, [pathname, execute, startPageLoading, callback]);

    return startPageLoading;
};
