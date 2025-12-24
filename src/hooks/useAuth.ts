import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "../services/redux/Hooks";
import {
    useGetGoogleStoredTokenMutation,
    useLazyGetGoogleAccessTokenQuery,
    useLogoutMutation,
    useRefreshTokenMutation,
} from "../services/apis/AuthenticateAPIs";
import { GetCookie } from "../utils/CookiesManager";
export default function useAuth({
    permission,
    reverse = false,
}: {
    permission?: string;
    reverse?: boolean;
} = {}) {
    const location = useLocation();
    const navigate = useNavigate();
    const [logoutMutation] = useLogoutMutation();
    const [refreshTokenMutation] = useRefreshTokenMutation();
    const user = useAppSelector((state) => state.user.user);
    const access_token = useAppSelector((state) => state.user.access_token);
    const permissions = useAppSelector((state) => state.user.permissions);
    useEffect(() => {
        (async () => {
            try {
                if (GetCookie("refresh_token") && !permission && reverse) {
                    navigate("/user", {
                        state: { error: "You are already logged in." },
                    });
                }
                if (!GetCookie("refresh_token") && !reverse) {
                    if (user || access_token) await logoutMutation().unwrap();
                    navigate("/login", {
                        state: {
                            error: "You must be logged in to access this resource.",
                        },
                    });
                }
                if (!GetCookie("access_token") && GetCookie("refresh_token")) {
                    await refreshTokenMutation(
                        GetCookie("refresh_token")!
                    ).unwrap();
                }
                if (user && permission) {
                    const hasPermission = permissions.includes(permission);
                    const normalPredicate = !hasPermission && !reverse;
                    const reversePredicate = hasPermission && reverse;
                    if (normalPredicate || reversePredicate) {
                        navigate("/user", {
                            state: {
                                error: "You do not have permission to access this resource.",
                            },
                        });
                    }
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
        user,
        access_token,
        permissions,
        navigate,
        logoutMutation,
        refreshTokenMutation,
        permission,
        reverse,
    ]);
    return null;
}

export function useGetGoogleAccessToken() {
    useAuth();
    const access_token = useAppSelector((state) => state.user.access_token);
    const [getGoogleStoredToken] = useGetGoogleStoredTokenMutation();
    const [getGoogleAccessToken] = useLazyGetGoogleAccessTokenQuery();
    useEffect(() => {
        (async () => {
            if (!access_token) return;
            try {
                if (
                    GetCookie("oauth_state") &&
                    GetCookie("google_details_token")
                )
                    await getGoogleStoredToken({
                        oauth_state: GetCookie("oauth_state")!,
                        google_details_token: GetCookie(
                            "google_details_token"
                        )!,
                    }).unwrap();
                await getGoogleAccessToken().unwrap();
            } catch {
                return;
            }
        })();
    }, [access_token, getGoogleAccessToken, getGoogleStoredToken]);
}
