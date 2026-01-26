import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { showToast } from "../utils/ToastsManager";

export default function useRouteMessages() {
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        const { success, error }: { success?: string; error?: string } =
            location.state || {};
        if (success) {
            showToast("success", "Success", success);
            navigate(location.pathname, {
                state: {
                    success: undefined,
                },
                replace: true,
            }); // Clear state after showing the message
        }
        if (error) {
            showToast("error", "Error", error);
            navigate(location.pathname, {
                state: {
                    error: undefined,
                },
                replace: true,
            }); // Clear state after showing the message
        }
    }, [location, navigate]);

    return null;
}
