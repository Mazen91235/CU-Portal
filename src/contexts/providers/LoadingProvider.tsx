import { useState } from "react";
import { LoadingContext } from "../contexts/LoadingContext";

export const LoadingProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [loading, setIsLoading] = useState<boolean>(false);
    const setLoading = () => setIsLoading(true);
    const clearLoading = () => setIsLoading(false);
    const toggleLoading = () => setIsLoading(!loading);

    const value = {
        loading,
        setLoading,
        clearLoading,
        toggleLoading,
    };
    return <LoadingContext value={value}>{children}</LoadingContext>;
};
