import useAuth from "../hooks/useAuth";
import { Outlet } from "react-router";

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
