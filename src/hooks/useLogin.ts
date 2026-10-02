import { useCallback } from "react";
import { useLazyIsLoggedInQuery } from "../services/apis/AuthenticateAPIs";

export const useLogin = () => {
    const [isLoggedIn] = useLazyIsLoggedInQuery();

    const checkLogin = useCallback(async () => {
        try {
            await isLoggedIn().unwrap();
            return true;
        } catch {
            return false;
        }
    }, [isLoggedIn]);

    return checkLogin;
};
