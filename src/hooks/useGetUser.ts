import { useEffect } from "react";
import {
    useLazyGetUserDataQuery,
    useLazyGetUserPermissionsQuery,
} from "../services/apis/user/UserAPIs";
import { useLogin } from "./useLogin";
import { useAppSelector } from "../services/redux/Hooks";

export default function useGetUser() {
    const [getUserData, { data }] = useLazyGetUserDataQuery();
    const [getUserPermissions] = useLazyGetUserPermissionsQuery();
    const user = useAppSelector((state) => state.user.user);
    const permissions = useAppSelector((state) => state.user.permissions);
    const isLoggedIn = useLogin();
    useEffect(() => {
        (async () => {
            if (user || (permissions?.length || 0) > 0) return;
            const loggedIn = await isLoggedIn();
            if (!loggedIn) return;
            try {
                await getUserData().unwrap();
                await getUserPermissions().unwrap();
            } catch {
                return;
            }
        })();
    }, [user, permissions, isLoggedIn, getUserData, getUserPermissions]);
    return data;
}
