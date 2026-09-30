import { useCallback, useEffect, useRef } from "react";
import { useLazyIsLoggedInQuery } from "../services/apis/AuthenticateAPIs";
import { validateCachedData } from "../utils/Validators";
import { useAppSelector } from "../services/redux/Hooks";

export const useLogin = () => {
    const [isLoggedIn] = useLazyIsLoggedInQuery();
    const isProcessing = useAppSelector((state) => state.user.isProcessing);
    const isProcessingRef = useRef(isProcessing);

    useEffect(() => {
        isProcessingRef.current = isProcessing;
    }, [isProcessing]);

    const checkLogin = useCallback(async () => {
        while (isProcessingRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        const isLoggedInData = localStorage.getItem("is-logged-in");
        if (isLoggedInData) {
            const isLoggedInParsed = JSON.parse(isLoggedInData);
            if (validateCachedData(isLoggedInParsed.last_fetched)) {
                return true;
            }
        }
        try {
            await isLoggedIn().unwrap();
            return true;
        } catch {
            return false;
        }
    }, [isLoggedIn]);

    return checkLogin;
};
