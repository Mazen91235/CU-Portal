import { useEffect, useState } from "react";
import { useAppSelector } from "../services/redux/Hooks";
import { handlePopupErrors } from "../utils/ErrorHandling";
import { useLoading } from "../contexts/hooks/useLoading";
import { validateUserAccess } from "../utils/Validators";
import { useLocation } from "react-router";
import { useLogin } from "./useLogin";
export function useAuthQuery<TTriggerArg, TReturn>(
    trigger: (arg?: TTriggerArg) => Promise<TReturn>,
) {
    const isLoggedIn = useLogin();
    const user = useAppSelector((state) => state.user.user);
    const location = useLocation();
    const [shouldLoad, setShouldLoad] = useState(true);
    const { setLoading, clearLoading } = useLoading();
    useEffect(() => {
        (async () => {
            const loggedIn = await isLoggedIn();
            const path = location.pathname;
            if (
                !loggedIn ||
                !user ||
                !validateUserAccess(user.level, path, user.role?.level)
            )
                return;
            try {
                if (shouldLoad) setLoading();
                await trigger().finally(() => setShouldLoad(false));
            } catch (error) {
                handlePopupErrors(error);
            }
        })();
    }, [user, isLoggedIn, trigger, shouldLoad, setLoading, location.pathname]);

    useEffect(() => {
        if (!shouldLoad) clearLoading();
    }, [shouldLoad, clearLoading]);

    useEffect(() => {
        setShouldLoad(true);
    }, [trigger]);
}

export default useAuthQuery;
