import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../services/redux/Hooks";
import {
    useGetGoogleStoredTokenMutation,
    useLazyGetGoogleAccessTokenQuery,
    useLogoutMutation,
    useRefreshTokenMutation,
} from "../services/apis/AuthenticateAPIs";
import { GetCookie } from "../utils/CookiesManager";
export default function useAuth(shouldBeLoggedIn = true) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [logoutMutation] = useLogoutMutation();
    const [refreshTokenMutation] = useRefreshTokenMutation();
    const [user, access_token] = useAppSelector((state) => [
        state.user.user,
        state.user.access_token,
    ]);
    useEffect(() => {
        (async () => {
            try {
                if (GetCookie("refresh_token") && !shouldBeLoggedIn) {
                    navigate("/user", {
                        state: { error: "You are already logged in." },
                    });
                }
                if (!GetCookie("refresh_token") && shouldBeLoggedIn) {
                    if (user || access_token)
                        await logoutMutation(access_token!);
                    navigate("/login", {
                        state: {
                            error: "You must be logged in to access this resource.",
                        },
                    });
                }
                if (!GetCookie("access_token") && GetCookie("refresh_token")) {
                    await refreshTokenMutation(GetCookie("refresh_token")!);
                }
            } catch {
                navigate("/login", {
                    state: {
                        error: "You must be logged in to access this resource.",
                    },
                });
            }
        })();
    }, [
        location,
        navigate,
        dispatch,
        logoutMutation,
        refreshTokenMutation,
        user,
        access_token,
        shouldBeLoggedIn,
    ]);
    return null;
}

export function useGetGoogleAccessToken() {
    useAuth();
    const access_token = useAppSelector((state) => state.user.access_token);
    const [getGoogleStoredToken] = useGetGoogleStoredTokenMutation();
    const [getGoogleAccessToken] = useLazyGetGoogleAccessTokenQuery();
    useEffect(() => {
        if (GetCookie("oauth_state") && GetCookie("google_details_token"))
            getGoogleStoredToken({
                oauth_state: GetCookie("oauth_state")!,
                google_details_token: GetCookie("google_details_token")!,
            });
        getGoogleAccessToken(access_token!);
    }, [access_token, getGoogleAccessToken, getGoogleStoredToken]);
}
