import { useCallback, useRef, useState } from "react";
import { useLazyIsLoggedInQuery } from "../services/apis/AuthenticateAPIs";
import { validateCachedData } from "../utils/Validators";

export const useLogin = () => {
    const [isLoggedIn] = useLazyIsLoggedInQuery();
    const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
    const issuedRef = useRef(false);
    const checkLogin = useCallback(async () => {
        if (issuedRef.current) return loggedIn;
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
                setLoggedIn(true);
                return true;
            }
        }
        try {
            await isLoggedIn().unwrap();
            setLoggedIn(true);
            return true;
        } catch {
            setLoggedIn(false);
            return false;
        }
    }, [isLoggedIn, loggedIn]);
    return checkLogin;
};
