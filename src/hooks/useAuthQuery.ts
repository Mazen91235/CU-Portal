import { useEffect, useState } from "react";
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
    const [shouldLoad, setShouldLoad] = useState(true);
    const { setLoading, clearLoading } = useLoading();

    useEffect(() => {
        let isMounted = true;

        (async () => {
            const path = location.pathname;

            // Early return - clear loading if not authorized
            if (
                !access_token ||
                !user ||
                !validateUserAccess(user.level, path, user.role?.level)
            ) {
                if (isMounted) {
                    setShouldLoad(false);
                    clearLoading();
                }
                return;
            }

            // Only set loading and trigger if shouldLoad is true
            if (!shouldLoad) {
                if (isMounted) clearLoading();
                return;
            }

            try {
                setLoading();
                await trigger();
            } catch (error) {
                handlePopupErrors(error);
            } finally {
                // Always clear loading after trigger completes or fails
                if (isMounted) {
                    setShouldLoad(false);
                    clearLoading();
                }
            }
        })();

        // Cleanup function to prevent state updates on unmounted component
        return () => {
            isMounted = false;
        };
    }, [
        access_token,
        user,
        trigger,
        shouldLoad,
        setLoading,
        clearLoading,
        location.pathname,
    ]);

    useEffect(() => {
        setShouldLoad(true);
    }, [trigger]);
}

export default useAuthQuery;
