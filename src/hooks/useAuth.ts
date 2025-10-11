import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAppDispatch } from "../services/redux/Hooks";
import { logout, setAccessToken } from "../services/redux/reducers/UserReducer";
import { GetCookie } from "../utils/CookiesManager";
export default function useAuth(shouldBeLoggedIn = true) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    useEffect(() => {
        try {
            if (GetCookie("refresh_token") && !shouldBeLoggedIn) {
                navigate("/user", {
                    state: { error: "You are already logged in." },
                });
            }
            if (!GetCookie("refresh_token")) {
                dispatch(logout());
                navigate("/login", {
                    state: {
                        error: "You must be logged in to access this resource.",
                    },
                });
            }
            if (!GetCookie("access_token")) {
                dispatch(setAccessToken(null));
            }
        } catch {
            navigate("/login", {
                state: {
                    error: "You must be logged in to access this resource.",
                },
            });
        }
    }, [location, navigate, dispatch, shouldBeLoggedIn]);
    return null;
}
