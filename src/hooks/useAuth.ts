import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "../services/redux/Hooks";
import {
    useGetGoogleStoredTokenMutation,
    useLazyGetGoogleAccessTokenQuery,
    useLazyLogoutQuery,
} from "../services/apis/AuthenticateAPIs";
import { GetCookie } from "../utils/CookiesManager";
import { useLogin } from "./useLogin";
import { useCheckCrawler } from "./useCheckCrawler";

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
    const [logout] = useLazyLogoutQuery();
    const isLoggedIn = useLogin();
    const checkCrawler = useCheckCrawler();
    const user = useAppSelector((state) => state.user.user);
    const isProcessing = useAppSelector((state) => state.user.isProcessing);
    const permissions = useAppSelector((state) => state.user.permissions);
    const { pathname, state } = useLocation();
    useEffect(() => {
        (async () => {
            if (checkCrawler()) return;
            if (state?.isProcessing) {
                navigate(pathname, {
                    state: {
                        ...state,
                        isProcessing: undefined,
                    },
                    replace: true,
                });
                return;
            }
            if (isProcessing) return;
            const loggedIn = await isLoggedIn();
            try {
                if (loggedIn && !permission && reverse) {
                    if (shouldNavigate)
                        navigate("/user", {
                            state: { error: "You are already logged in." },
                        });
                }
                if (!loggedIn && !reverse) {
                    if (user) await logout().unwrap();
                    if (shouldNavigate)
                        navigate("/login", {
                            state: {
                                error: "You must be logged in to access this resource.",
                            },
                        });
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
        permissions,
        pathname,
        state,
        isProcessing,
        navigate,
        logout,
        isLoggedIn,
        checkCrawler,
        permission,
        reverse,
        shouldNavigate,
    ]);
    return null;
}

export function useGetGoogleAccessToken() {
    useAuth({ shouldNavigate: false });
    const [isLoading, setIsLoading] = useState(true);
    const [getGoogleStoredTokenMutation] = useGetGoogleStoredTokenMutation();
    const [getGoogleAccessTokenMutation] = useLazyGetGoogleAccessTokenQuery();
    const isLoggedIn = useLogin();

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            let loggedIn = false;
            try {
                loggedIn = await isLoggedIn();
                if (
                    GetCookie("oauth_state") &&
                    GetCookie("google_details_token") &&
                    !loggedIn
                )
                    await getGoogleStoredTokenMutation({
                        oauth_state: GetCookie("oauth_state")!,
                        google_details_token: GetCookie(
                            "google_details_token",
                        )!,
                    }).unwrap();
                if (loggedIn) await getGoogleAccessTokenMutation().unwrap();
            } catch {
                return;
            } finally {
                setIsLoading(false);
            }
        })();
    }, [
        getGoogleStoredTokenMutation,
        getGoogleAccessTokenMutation,
        isLoggedIn,
    ]);

    return isLoading;
}
