import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "../services/redux/Hooks";
import { useEffect } from "react";
import { validateUserAccess } from "../utils/Validators";

export const useValidateUserLevel = () => {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    useEffect(() => {
        if (
            !user ||
            (user.level || 4) > 3 ||
            (!pathname.includes("/user") && !pathname.includes("/admin"))
        )
            return;
        if (!validateUserAccess(user.level, pathname, user.role?.level)) {
            navigate("/user", {
                state: {
                    error: "Please complete the required steps to proceed.",
                },
            });
        }
    }, [user, pathname, navigate]);
};
