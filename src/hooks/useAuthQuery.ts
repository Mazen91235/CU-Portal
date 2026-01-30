import { useEffect, useState } from "react";
import { useAppSelector } from "../services/redux/Hooks";
import { handlePopupErrors } from "../utils/ErrorHandling";
import { useLoading } from "../contexts/hooks/useLoading";
export function useAuthQuery<TTriggerArg, TReturn>(
    trigger: (arg?: TTriggerArg) => Promise<TReturn>,
) {
    const access_token = useAppSelector((state) => state.user.access_token);
    const [shouldLoad, setShouldLoad] = useState(true);
    const { setLoading, clearLoading } = useLoading();
    useEffect(() => {
        (async () => {
            if (!access_token) return;
            try {
                if (shouldLoad) setLoading();
                await trigger().finally(() => setShouldLoad(false));
            } catch (error) {
                handlePopupErrors(error);
            }
        })();
    }, [access_token, trigger, shouldLoad, setLoading]);

    useEffect(() => {
        if (!shouldLoad) clearLoading();
    }, [shouldLoad, clearLoading]);

    useEffect(() => {
        setShouldLoad(true);
    }, [trigger]);
}

export default useAuthQuery;
