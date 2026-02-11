import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../services/redux/Hooks";
import {
    useGetGoogleStoredTokenMutation,
    useLazyGetGoogleAccessTokenQuery,
    useLazyLogoutQuery,
    useRefreshTokenMutation,
} from "../services/apis/AuthenticateAPIs";
import { GetCookie, SetCookie } from "../utils/CookiesManager";
import {
    setAccessToken,
    setIsProcessing,
} from "../services/redux/reducers/UserReducer";
export default function useAuth({
    permission,
    reverse = false,
    shouldNavigate = true,
}: {
    permission?: string;
    reverse?: boolean;
    shouldNavigate?: boolean;
} = {}) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [logout] = useLazyLogoutQuery();
    const refreshTokenRef = useRef<number | null>(null);
    const [refreshTokenMutation] = useRefreshTokenMutation();
    const user = useAppSelector((state) => state.user.user);
    const access_token = useAppSelector((state) => state.user.access_token);
    const isProcessing = useAppSelector((state) => state.user.isProcessing);
    const permissions = useAppSelector((state) => state.user.permissions);
    const location = useLocation();
    const refreshToken = useCallback(
        async (retries: number = 3) => {
            try {
                await refreshTokenMutation(
                    GetCookie("refresh_token")!,
                ).unwrap();
                if (refreshTokenRef.current)
                    clearTimeout(refreshTokenRef.current);
                refreshTokenRef.current = setTimeout(
                    () => {
                        refreshToken();
                    },
                    8 * 60 * 1000, // 8 minutes
                );
            } catch {
                if (retries > 0) {
                    await refreshToken(retries - 1);
                    return;
                }
                SetCookie("refresh_token", "", -1);
                if (shouldNavigate)
                    navigate("/login", {
                        state: {
                            error: "Session expired. Please log in again.",
                        },
                    });
                return;
            }
        },
        [refreshTokenMutation, navigate, shouldNavigate],
    );
    useEffect(() => {
        (async () => {
            if (location.state?.isProcessing) {
                dispatch(setIsProcessing(false));
                navigate(location.pathname, {
                    replace: true,
                    state: {
                        isProcessing: false,
                    },
                });
                return;
            }
            if (isProcessing) return;
            try {
                if (GetCookie("refresh_token") && !permission && reverse) {
                    if (shouldNavigate)
                        navigate("/user", {
                            state: { error: "You are already logged in." },
                        });
                }
                if (!GetCookie("refresh_token") && !reverse) {
                    if (user || access_token) await logout().unwrap();
                    if (shouldNavigate)
                        navigate("/login", {
                            state: {
                                error: "You must be logged in to access this resource.",
                            },
                        });
                }
                if (!GetCookie("access_token") && GetCookie("refresh_token")) {
                    await refreshToken();
                }
                if (!access_token && GetCookie("access_token")) {
                    dispatch(setAccessToken(GetCookie("access_token")!));
                }
                if (user && permissions && permission) {
                    const hasPermission = permissions.includes(permission);
                    const normalPredicate = !hasPermission && !reverse;
                    const reversePredicate = hasPermission && reverse;
                    if (normalPredicate || reversePredicate) {
                        if (shouldNavigate)
                            navigate("/user", {
                                state: {
                                    error: "You do not have permission to access this resource.",
                                },
                            });
                    }
                }
            } catch {
                if (shouldNavigate)
                    navigate("/login", {
                        state: {
                            error: "You must be logged in to access this resource.",
                        },
                    });
            }
        })();
    }, [
        user,
        access_token,
        isProcessing,
        permissions,
        location,
        navigate,
        dispatch,
        logout,
        refreshToken,
        permission,
        reverse,
        shouldNavigate,
    ]);
    return null;
}

export function useGetGoogleAccessToken() {
    useAuth({ shouldNavigate: false });
    const access_token = useAppSelector((state) => state.user.access_token);
    const [getGoogleStoredToken] = useGetGoogleStoredTokenMutation();
    const [getGoogleAccessToken] = useLazyGetGoogleAccessTokenQuery();
    useEffect(() => {
        (async () => {
            try {
                if (
                    GetCookie("oauth_state") &&
                    GetCookie("google_details_token")
                )
                    await getGoogleStoredToken({
                        oauth_state: GetCookie("oauth_state")!,
                        google_details_token: GetCookie(
                            "google_details_token",
                        )!,
                    }).unwrap();
                if (!access_token) return;
                await getGoogleAccessToken().unwrap();
            } catch {
                return;
            }
        })();
    }, [access_token, getGoogleAccessToken, getGoogleStoredToken]);
}
