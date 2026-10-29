import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { isPlatformSuspended } from "../utils/PlatformStatus";

const publicPaths = new Set([
    "/",
    "/our-team",
    "/terms-of-service",
    "/privacy-policy",
    "/suspended",
]);

export const useSuspensionRedirect = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isPlatformSuspended() && !publicPaths.has(pathname)) {
            navigate("/suspended", { replace: true });
        }
    }, [navigate, pathname]);
};