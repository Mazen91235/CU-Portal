import { useState } from "react";
import { LoadingContext } from "../contexts/LoadingContext";

export const LoadingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [loadingCount, setLoadingCount] = useState<number>(0);
  const loading = loadingCount > 0;

  const startLoading = () => setLoadingCount((c) => c + 1);
  const stopLoading = () => setLoadingCount((c) => Math.max(0, c - 1));

  const value = {
    loading,
    startLoading,
    stopLoading,
  };
  return <LoadingContext value={value}>{children}</LoadingContext>;
};
