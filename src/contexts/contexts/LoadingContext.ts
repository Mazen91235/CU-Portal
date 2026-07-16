import { createContext } from "react";

type LoadingContextType = {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  //   toggleLoading: () => void;
};

export const LoadingContext = createContext<LoadingContextType>(null!);
