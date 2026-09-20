import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { showToast } from "../utils/ToastsManager";

export default function useRouteMessages() {
    const { pathname, state } = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        const { success, error }: { success?: string; error?: string } =
            state || {};
        if (success || searchParams.get("success")) {
            showToast(
                "success",
                "Success",
                success || searchParams.get("success") || "",
            );
            navigate(pathname, {
                state: {
                    success: undefined,
                },
                replace: true,
            }); // Clear state after showing the message
        }
        if (error || searchParams.get("error")) {
            showToast(
                "error",
                "Error",
                error || searchParams.get("error") || "",
            );
            navigate(pathname, {
                state: {
                    error: undefined,
                },
                replace: true,
            }); // Clear state after showing the message
        }
        if (searchParams.get("success") || searchParams.get("error")) {
            setSearchParams({}, { replace: true }); // Clear query params after showing the message
        }
    }, [pathname, state, searchParams, navigate, setSearchParams]);

    return null;
}
