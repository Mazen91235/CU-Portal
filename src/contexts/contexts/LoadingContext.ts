import { createContext } from "react";

type LoadingContextType = {
    loading: boolean;
    setLoading: () => void;
    clearLoading: () => void;
    toggleLoading: () => void;
};

export const LoadingContext = createContext<LoadingContextType>(null!);
