import { useCallback } from "react";
import { useLazyIsLoggedInQuery } from "../services/apis/AuthenticateAPIs";
import { validateCachedData } from "../utils/Validators";
import { useAppSelector } from "../services/redux/Hooks";

export const useLogin = () => {
    const [isLoggedIn] = useLazyIsLoggedInQuery();
    const isProcessing = useAppSelector((state) => state.user.isProcessing);

    const checkLogin = useCallback(async () => {
        if (isProcessing) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            return checkLogin();
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
    }, [isLoggedIn, isProcessing]);
    return checkLogin;
};
