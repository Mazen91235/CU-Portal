import { createContext } from "react";

export type LoadingRelease = () => void;

type LoadingContextType = {
  loading: boolean;
  startLoading: () => LoadingRelease;
};

export const LoadingContext = createContext<LoadingContextType>(null!);
