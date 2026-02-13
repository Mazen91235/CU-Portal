import { useEffect, useRef } from "react";
import { useAppSelector } from "../services/redux/Hooks";
import { handlePopupErrors } from "../utils/ErrorHandling";
import { useLoading } from "../contexts/hooks/useLoading";
import { validateUserAccess } from "../utils/Validators";
import { useLocation } from "react-router";
export function useAuthQuery<TTriggerArg, TReturn>(
    trigger: (arg?: TTriggerArg) => Promise<TReturn>,
) {
    const access_token = useAppSelector((state) => state.user.access_token);
    const user = useAppSelector((state) => state.user.user);
    const location = useLocation();
    const { setLoading, clearLoading } = useLoading();
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        let isCancelled = false;
        hasLoadedRef.current = false;

        const executeQuery = async () => {
            const path = location.pathname;

            // Check authorization
            const isAuthorized =
                access_token &&
                user &&
                validateUserAccess(user.level, path, user.role?.level);

            // If not authorized, ensure loading is cleared
            if (!isAuthorized) {
                clearLoading();
                return;
            }

            // If already loaded, don't load again
            if (hasLoadedRef.current) {
                clearLoading();
                return;
            }

            // Set loading and execute trigger
            setLoading();

            try {
                await trigger();
                hasLoadedRef.current = true;
            } catch (error) {
                handlePopupErrors(error);
            } finally {
                // Always clear loading, even if component unmounted
                if (!isCancelled) {
                    clearLoading();
                }
            }
        };

        executeQuery();

        // Cleanup function
        return () => {
            isCancelled = true;
            clearLoading();
        };
    }, [
        access_token,
        user,
        trigger,
        setLoading,
        clearLoading,
        location.pathname,
    ]);
}

export default useAuthQuery;
