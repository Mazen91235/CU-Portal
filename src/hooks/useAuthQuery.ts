import { useEffect } from "react";
import { useAppSelector } from "../services/redux/Hooks";
import { handlePopupErrors } from "../utils/ErrorHandling";
import { validateUserAccess } from "../utils/Validators";
import { useLocation } from "react-router";
import { useLogin } from "./useLogin";
import { usePageLoading } from "./usePageLoading";
export function useAuthQuery<TTriggerArg, TReturn>(
    trigger: (arg?: TTriggerArg) => Promise<TReturn>,
) {
    const isLoggedIn = useLogin();
    const user = useAppSelector((state) => state.user.user);
    const location = useLocation();
    const startPageLoading = usePageLoading();

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
                await trigger().finally(() => startPageLoading());
            } catch (error) {
                handlePopupErrors(error);
            }
        })();
    }, [user, isLoggedIn, trigger, startPageLoading, location.pathname]);
}

export default useAuthQuery;
