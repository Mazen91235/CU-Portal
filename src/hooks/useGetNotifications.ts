import { useEffect } from "react";
import { useLazyGetNotificationsQuery } from "../services/apis/user/NotificationAPIs";
import { useLocation } from "react-router";
import { useAppSelector } from "../services/redux/Hooks";

export default function useGetNotifications({
    seen = false,
    page = 1,
    limit = 50,
}: { seen?: boolean; page?: number; limit?: number } = {}) {
    const location = useLocation();
    const access_token = useAppSelector((state) => state.user.access_token);
    const [getNotifications, { data }] = useLazyGetNotificationsQuery();
    useEffect(() => {
        (async () => {
            try {
                if (!access_token) return;
                await getNotifications({ seen, page, limit }).unwrap();
            } catch {
                return;
            }
        })();
    }, [location, access_token, seen, page, limit, getNotifications]);
    return data;
}
