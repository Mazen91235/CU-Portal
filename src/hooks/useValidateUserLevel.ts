import { useLocation, useNavigate } from "react-router";
import { useAppSelector } from "../services/redux/Hooks";
import { useEffect } from "react";
import { validateUserAccess } from "../utils/Validators";

export const useValidateUserLevel = () => {
    const user = useAppSelector((state) => state.user.user);
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (
            !user ||
            (user.level || 4) > 3 ||
            (!location.pathname.includes("/user") &&
                !location.pathname.includes("/admin"))
        )
            return;
        if (
            !validateUserAccess(user.level, location.pathname, user.role?.level)
        ) {
            navigate("/user", {
                state: {
                    error: "Please complete the required steps to proceed.",
                },
            });
        }
    }, [user, location, navigate]);
};
