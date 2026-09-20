import { useCallback, useMemo, useState } from "react";
import { LoadingContext } from "../contexts/LoadingContext";

export const LoadingProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [loadingCount, setLoadingCount] = useState<number>(0);
    const loading = loadingCount > 0;

    const startLoading = useCallback(
        () => setLoadingCount((count) => count + 1),
        [],
    );

    const stopLoading = useCallback(
        () => setLoadingCount((count) => Math.max(0, count - 1)),
        [],
    );

    const value = useMemo(
        () => ({
            loading,
            startLoading,
            stopLoading,
        }),
        [loading, startLoading, stopLoading],
    );

    return (
        <LoadingContext value={value}>
            {children}
        </LoadingContext>
    );
};
