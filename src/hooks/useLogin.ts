import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { setAccessToken } from "../services/redux/reducers/UserReducer";
import { SetCookie } from "../utils/CookiesManager";
import { useAppDispatch } from "../services/redux/Hooks";
import useAuth from "./useAuth";
import { useLazyGetUserPermissionsQuery } from "../services/apis/UserAPIs";
export default function useLogin() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [getUserPermissions] = useLazyGetUserPermissionsQuery();
    const [ searchParams ] = useSearchParams();
    useAuth(false);
    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            return;
        }
        const [
            access_token,
            access_expires_in,
            refresh_token,
            refresh_expires_in,
        ] = token.split("___");
        if (
            !access_token ||
            !access_expires_in ||
            !refresh_token ||
            !refresh_expires_in
        ) {
            navigate("/", { state: { error: "Invalid Request" } });
            return;
        }
        SetCookie("access_token", access_token, parseInt(access_expires_in));
        SetCookie("refresh_token", refresh_token, parseInt(refresh_expires_in));
        dispatch(setAccessToken(access_token));
        getUserPermissions();
        navigate("/", { state: { success: "Logged in successfully" } });
    }, [navigate, dispatch, getUserPermissions, searchParams]);
    return null;
}
