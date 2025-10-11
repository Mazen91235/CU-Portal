import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppDispatch } from "../services/redux/Hooks";
import { useLogoutMutation, useRefreshTokenMutation } from "../services/apis/AuthenticateAPIs";
import { GetCookie } from "../utils/CookiesManager";
export default function useAuth(shouldBeLoggedIn = true) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [ logoutMutation ] = useLogoutMutation();
    const [ refreshTokenMutation ] = useRefreshTokenMutation();
    useEffect(() => {
        (async () => {
        try {
            if (GetCookie("refresh_token") && !shouldBeLoggedIn) {
                navigate("/user", {
                    state: { error: "You are already logged in." },
                });
            }
            if (!GetCookie("refresh_token")) {
                await logoutMutation();
                navigate("/login", {
                    state: {
                        error: "You must be logged in to access this resource.",
                    },
                });
            }
            if (!GetCookie("access_token")) {
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
    }, [location, navigate, dispatch, logoutMutation, refreshTokenMutation, shouldBeLoggedIn]);
    return null;
}
