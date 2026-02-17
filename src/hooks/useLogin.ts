import { useCallback } from "react";
import { useLazyIsLoggedInQuery } from "../services/apis/AuthenticateAPIs";
import { validateCachedData } from "../utils/Validators";

export const useLogin = () => {
    const [isLoggedIn] = useLazyIsLoggedInQuery();
    const checkLogin = useCallback(async () => {
        const userData = localStorage.getItem("user");
        const permissionsData = localStorage.getItem("permissions");
        if (userData && permissionsData) {
            const userParsed = JSON.parse(userData);
            const permissionsParsed = JSON.parse(permissionsData);
            if (
                validateCachedData(userParsed.last_fetched) &&
                validateCachedData(permissionsParsed.last_fetched)
            ) {
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
