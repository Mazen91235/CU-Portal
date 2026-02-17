import { useEffect, useRef } from "react";
import {
    useLazyGetUserDataQuery,
    useLazyGetUserPermissionsQuery,
} from "../services/apis/user/UserAPIs";
import { useLogin } from "./useLogin";
import { useAppDispatch, useAppSelector } from "../services/redux/Hooks";
import { validateCachedData } from "../utils/Validators";
import {
    setPermissions,
    setUser,
} from "../services/redux/reducers/UserReducer";

export default function useGetUser() {
    const dispatch = useAppDispatch();
    const [getUserData, { data }] = useLazyGetUserDataQuery();
    const [getUserPermissions] = useLazyGetUserPermissionsQuery();
    const issuedRef = useRef(false);
    const user = useAppSelector((state) => state.user.user);
    const permissions = useAppSelector((state) => state.user.permissions);
    const isLoggedIn = useLogin();
    useEffect(() => {
        (async () => {
            if (issuedRef.current) return;
            issuedRef.current = true;
            if (user || (permissions?.length || 0) > 0) return;
            const userStored = localStorage.getItem("user");
            const permissionsStored = localStorage.getItem("permissions");
            let validUserCached = false;
            let validPermissionsCached = false;
            if (userStored) {
                const userData = JSON.parse(userStored);
                if (validateCachedData(userData.last_fetched)) {
                    validUserCached = true;
                    dispatch(setUser(userData));
                }
            }
            if (permissionsStored) {
                const permissionsData = JSON.parse(permissionsStored);
                if (validateCachedData(permissionsData.last_fetched)) {
                    validPermissionsCached = true;
                    dispatch(setPermissions(permissionsData.permissions));
                }
            }
            if (!validUserCached || !validPermissionsCached) {
                const loggedIn = await isLoggedIn();
                if (!loggedIn) return;
            }
            try {
                if (!validUserCached) await getUserData().unwrap();
                if (!validPermissionsCached)
                    await getUserPermissions().unwrap();
            } catch {
                return;
            }
        })();
    }, [
        user,
        permissions,
        dispatch,
        getUserData,
        getUserPermissions,
        isLoggedIn,
    ]);
    return data;
}
