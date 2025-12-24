import { useCallback, useEffect } from "react";
import {
    useLazyGetUserDataQuery,
    useLazyGetUserPermissionsQuery,
} from "../services/apis/user/UserAPIs";
import { useAppSelector } from "../services/redux/Hooks";

export default function useGetUser() {
    const access_token = useAppSelector((state) => state.user.access_token);
    const [getUserData, { data }] = useLazyGetUserDataQuery();
    const [getUserPermissions] = useLazyGetUserPermissionsQuery();
    const getUser = useCallback(
        async (maxRetries = 3) => {
            try {
                if (!access_token) return;
                await getUserData();
                await getUserPermissions();
            } catch {
                if (maxRetries > 0) {
                    return await getUser(maxRetries - 1);
                }
                return;
            }
        },
        [access_token, getUserData, getUserPermissions]
    );
    useEffect(() => {
        (async () => {
            try {
                await getUser();
            } catch {
                // Ignore errors
            }
        })();
    }, [access_token, getUser]);
    return data;
}
