import useAuth from "../hooks/useAuth";
import {Outlet} from "react-router";

export default function ProtectedRoute() {
    useAuth();
    return <Outlet />;
}
