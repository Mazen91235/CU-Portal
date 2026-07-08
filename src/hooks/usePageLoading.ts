import { useCallback, useEffect, useRef } from "react";
import { useLoading } from "../contexts/hooks/useLoading";
import { useLocation } from "react-router";

export const usePageLoading = (
  execute: boolean = false,
  callback?: () => void,
) => {
  const cleanupRef = useRef<(() => void) | null>(null);
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();

  const startPageLoading = useCallback(
    (cb?: () => void) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      startLoading();

      const handleLoaded = () => {
        stopLoading();
        document.removeEventListener("readystatechange", handleLoaded);
        cleanupRef.current = null;
        if (cb) cb();
      };

      if (document.readyState === "complete") {
        handleLoaded();
      } else {
        document.addEventListener("readystatechange", handleLoaded);
        cleanupRef.current = () => {
          document.removeEventListener("readystatechange", handleLoaded);
          stopLoading();
        };
      }
    },
    [startLoading, stopLoading],
  );

  useEffect(() => {
    if (execute) startPageLoading(callback);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [location, execute, startPageLoading]);

  return startPageLoading;
};
