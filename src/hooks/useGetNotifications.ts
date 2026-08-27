import { useEffect } from "react";
import { useLazyGetNotificationsQuery } from "../services/apis/user/NotificationAPIs";
import { useLocation } from "react-router";
import { useLogin } from "./useLogin";

export default function useGetNotifications({
    seen = false,
    page = 1,
    limit = 50,
}: { seen?: boolean; page?: number; limit?: number } = {}) {
    const location = useLocation();
    const isLoggedIn = useLogin();
    const [getNotifications, { data }] = useLazyGetNotificationsQuery();
    useEffect(() => {
        (async () => {
            const loggedIn = await isLoggedIn();
            try {
                if (!loggedIn) return;
                await getNotifications({ data: { seen }, page, limit }).unwrap();
            } catch {
                return;
            }
        })();
    }, [location, seen, page, limit, isLoggedIn, getNotifications]);
    return data;
}
