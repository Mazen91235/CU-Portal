import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { showToast } from "../utils/ToastsManager";

export default function useRouteMessages() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        const { success, error }: { success?: string; error?: string } =
            location.state || {};
        if (success || searchParams.get("success")) {
            showToast(
                "success",
                "Success",
                success || searchParams.get("success") || "",
            );
            navigate(location.pathname, {
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
            navigate(location.pathname, {
                state: {
                    error: undefined,
                },
                replace: true,
            }); // Clear state after showing the message
        }
        if (searchParams.get("success") || searchParams.get("error")) {
            setSearchParams({}, { replace: true }); // Clear query params after showing the message
        }
    }, [location, searchParams, navigate, setSearchParams]);

    return null;
}
