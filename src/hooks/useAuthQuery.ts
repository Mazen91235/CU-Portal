import { useEffect } from "react";
import { useAppSelector } from "../services/redux/Hooks";
import { handlePopupErrors } from "../utils/ErrorHandling";
export function useAuthQuery<TTriggerArg, TReturn>(
    trigger: (arg?: TTriggerArg) => Promise<TReturn>
) {
    const access_token = useAppSelector((state) => state.user.access_token);

    useEffect(() => {
        (async () => {
            if (!access_token) return;
            try {
                await trigger();
            } catch (error) {
                handlePopupErrors(error);
            }
        })();
    }, [access_token, trigger]);
}

export default useAuthQuery;
