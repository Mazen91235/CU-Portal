import { useEffect } from "react";
import { useAppSelector } from "../services/redux/Hooks";
import { handlePopupErrors } from "../utils/ErrorHandling";
import { validateUserAccess } from "../utils/Validators";
import { useLocation } from "react-router";
import { useLogin } from "./useLogin";
import { useLoading } from "../contexts/hooks/useLoading";

export function useAuthQuery<TTriggerArg, TReturn>(
    trigger: (arg?: TTriggerArg) => Promise<TReturn>,
) {
    const isLoggedIn = useLogin();
    const user = useAppSelector((state) => state.user.user);
    const { pathname } = useLocation();
    const { startLoading, stopLoading } = useLoading();

    useEffect(() => {
        startLoading();

        const runQuery = async () => {
            try {
                const loggedIn = await isLoggedIn();

                if (
                    !loggedIn ||
                    !user ||
                    !validateUserAccess(
                        user.level,
                        pathname,
                        user.role?.level,
                    )
                )
                    return;

                await trigger();
            } catch (error) {
                handlePopupErrors(error);
            } finally {
                stopLoading();
            }
        };

        void runQuery();
    }, [
        user,
        isLoggedIn,
        trigger,
        startLoading,
        stopLoading,
        pathname,
    ]);
}

export default useAuthQuery;
