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
        (async () => {
            const path = location.pathname;
            if (!access_token || !user || !validateUserAccess(user.level, path))
                return;
            try {
                if (shouldLoad) setLoading();
                await trigger().finally(() => setShouldLoad(false));
            } catch (error) {
                handlePopupErrors(error);
            }
        })();
    }, [
        access_token,
        user,
        trigger,
        shouldLoad,
        setLoading,
        location.pathname,
    ]);

    useEffect(() => {
        if (!shouldLoad) clearLoading();
    }, [shouldLoad, clearLoading]);

    useEffect(() => {
        setShouldLoad(true);
    }, [trigger]);
}

export default useAuthQuery;
