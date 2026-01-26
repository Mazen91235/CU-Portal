import { Outlet } from "react-router";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({
    permission,
    reverse,
}: {
    permission?: string;
    reverse?: boolean;
}) {
    useAuth({ permission, reverse });
    return <Outlet />;
}
