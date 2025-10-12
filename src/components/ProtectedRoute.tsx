import useAuth from "../hooks/useAuth";
import {Outlet, useNavigate} from "react-router";
import { useAppSelector } from "../services/redux/Hooks";

export default function ProtectedRoute({ permission }: { permission?: string }) {
    useAuth();
    const navigate = useNavigate();
    const permissions = useAppSelector((state) => state.user.permissions);
    if (permission && !permissions.includes(permission)) {
        navigate("/user", { state: { error: "You don't have permission to access that page." } });
        return null;
    }
    return <Outlet />;
}
