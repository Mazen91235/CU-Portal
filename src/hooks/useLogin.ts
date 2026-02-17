import { useCallback, useRef } from "react";
import { useLazyIsLoggedInQuery } from "../services/apis/AuthenticateAPIs";
import { validateCachedData } from "../utils/Validators";

export const useLogin = () => {
    const [isLoggedIn] = useLazyIsLoggedInQuery();
    const loggedInRef = useRef<boolean | null>(null);
    const issuedRef = useRef(false);
    const checkLogin = useCallback(async () => {
        if (issuedRef.current) return loggedInRef.current;
        issuedRef.current = true;
        const userData = localStorage.getItem("user");
        const permissionsData = localStorage.getItem("permissions");
        if (userData && permissionsData) {
            const userParsed = JSON.parse(userData);
            const permissionsParsed = JSON.parse(permissionsData);
            if (
                validateCachedData(userParsed.last_fetched) &&
                validateCachedData(permissionsParsed.last_fetched)
            ) {
                loggedInRef.current = true;
                return true;
            }
        }
        try {
            await isLoggedIn().unwrap();
            loggedInRef.current = true;
            return true;
        } catch {
            loggedInRef.current = false;
            return false;
        }
    }, [isLoggedIn]);
    return checkLogin;
};
