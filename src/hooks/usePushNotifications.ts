import { useEffect, useCallback, useState } from "react";
import { messaging, requestFcmToken } from "../utils/firebaseManager";
import { onMessage } from "firebase/messaging";
import {
    useRegisterDeviceMutation,
    useUnregisterDeviceMutation,
} from "../services/apis/user/UserAPIs";
import { useMarkNotificationAsSeenMutation } from "../services/apis/user/NotificationAPIs";
import { useLogin } from "./useLogin";
import { useAppSelector } from "../services/redux/Hooks";

export function usePushNotifications() {
    const [registerDevice] = useRegisterDeviceMutation();
    const [unregisterDevice] = useUnregisterDeviceMutation();
    const [markNotificationAsSeen] = useMarkNotificationAsSeenMutation();
    const isLoggedIn = useLogin();
    const user = useAppSelector((state) => state.user.user);
    const [permission, setPermission] = useState<NotificationPermission>(() =>
        typeof window !== "undefined" && "Notification" in window
            ? Notification.permission
            : "default",
    );
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);

    const syncToken = useCallback(
        async (currentPermission = permission) => {
            if (!("Notification" in window)) return;

            if (currentPermission === "granted") {
                const savedToken = localStorage.getItem("fcm_token");
                if (savedToken) return;
                const token = await requestFcmToken();
                if (token) {
                    await registerDevice({ device_token: token }).unwrap();
                    localStorage.setItem("fcm_token", token);
                }
            } else if (currentPermission === "denied") {
                const savedToken = localStorage.getItem("fcm_token");
                if (savedToken) {
                    await unregisterDevice({
                        device_token: savedToken,
                    }).unwrap();
                    localStorage.removeItem("fcm_token");
                }
            }
        },
        [permission, registerDevice, unregisterDevice],
    );

    const requestNotificationPermission = useCallback(async () => {
        if (!("Notification" in window) || isRequestingPermission) return;

        setIsRequestingPermission(true);
        try {
            let nextPermission = Notification.permission;

            if (nextPermission === "default") {
                nextPermission = await Notification.requestPermission();
            }

            setPermission(nextPermission);
            await syncToken(nextPermission);
        } finally {
            setIsRequestingPermission(false);
        }
    }, [isRequestingPermission, syncToken]);

    useEffect(() => {
        let unsubscribeOnMessage = () => {};
        let permissionStatus: PermissionStatus | null = null;

        const initPush = async () => {
            const loggedIn = await isLoggedIn();
            if (!loggedIn || !user) return;

            await syncToken();

            if ("permissions" in navigator) {
                try {
                    permissionStatus = await navigator.permissions.query({
                        name: "notifications" as PermissionName,
                    });
                    permissionStatus.onchange = () => {
                        const nextPermission =
                            permissionStatus?.state === "prompt"
                                ? "default"
                                : permissionStatus?.state;
                        if (!nextPermission) return;
                        setPermission(nextPermission);
                        syncToken(nextPermission);
                    };
                } catch {
                    permissionStatus = null;
                }
            }

            // Listen for foreground FCM messages
            unsubscribeOnMessage = onMessage(messaging, (payload) => {
                const title =
                    payload.notification?.title ||
                    payload.data?.title ||
                    "New Notification";
                const body =
                    payload.notification?.body || payload.data?.body || "";
                const icon = payload.data?.icon || "/logo.png";
                const targetUrl = payload.data?.url || "/";
                const notificationId = parseInt(
                    payload.data?.notification_id || "0",
                );

                if (Notification.permission === "granted") {
                    const notification = new Notification(title, {
                        body,
                        icon,
                        data: payload.data || {},
                    });

                    notification.onclick = (event) => {
                        event.preventDefault();
                        window.focus();
                        window.location.href = targetUrl;
                        (async () => {
                            if (notificationId) {
                                await markNotificationAsSeen({
                                    notification_id: notificationId,
                                }).unwrap();
                            }
                        })();
                        notification.close();
                    };
                }
            });
        };

        initPush();

        // Cleanup foreground listener when unmounting or logging out
        return () => {
            unsubscribeOnMessage();
            if (permissionStatus) permissionStatus.onchange = null;
        };
    }, [user, isLoggedIn, syncToken, markNotificationAsSeen]);

    return {
        permission,
        isRequestingPermission,
        requestNotificationPermission,
    };
}
