import { useEffect } from "react";
import { useLazyGetNotificationsQuery } from "../services/apis/NotificationAPIs";
import { useLocation } from "react-router";

export default function useGetNotifications(seen: boolean = false, page: number = 1, limit: number = 50) {
    const location = useLocation();
    const [getNotifications, { data }] = useLazyGetNotificationsQuery();
    useEffect(() => {
        getNotifications({ seen, page, limit });
    }, [location, seen, page, limit, getNotifications]);
    return data;
}
