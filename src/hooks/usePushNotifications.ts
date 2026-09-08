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

type ForegroundNotification = {
    title: string;
    content: string;
    url: string;
    notificationId: number;
};

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
    const [isSyncingToken, setIsSyncingToken] = useState(false);
    const [foregroundNotification, setForegroundNotification] =
        useState<ForegroundNotification | null>(null);

    const getSavedTokenDetails = () => {
        try {
            const savedTokenDetails = JSON.parse(
                localStorage.getItem("fcm_token") || "{}",
            );
            return {
                token: savedTokenDetails.token,
                timestamp: savedTokenDetails.timestamp,
            };
        } catch {
            return {
                token: null,
                timestamp: null,
            };
        }
    };

    const setSavedTokenDetails = (token: string) => {
        if (!token) localStorage.removeItem("fcm_token");
        localStorage.setItem(
            "fcm_token",
            JSON.stringify({
                token: token,
                timestamp: Date.now(),
            }),
        );
    };

    const syncToken = useCallback(
        async (currentPermission = permission) => {
            if (!("Notification" in window) || isSyncingToken) return;

            setIsSyncingToken(true);
            try {
                if (currentPermission === "granted") {
                    const savedTokenDetails = getSavedTokenDetails();
                    if (
                        savedTokenDetails.token &&
                        savedTokenDetails.timestamp &&
                        Date.now() - savedTokenDetails.timestamp <
                            1 * 60 * 60 * 1000
                    )
                        return; // 1 hour valid
                    const token = await requestFcmToken();
                    if (token) {
                        await registerDevice({ device_token: token }).unwrap();
                        setSavedTokenDetails(token);
                    }
                } else {
                    const savedTokenDetails = getSavedTokenDetails();
                    if (savedTokenDetails.token) {
                        await unregisterDevice({
                            device_token: savedTokenDetails.token,
                        }).unwrap();
                        setSavedTokenDetails("");
                    }
                }
            } finally {
                setIsSyncingToken(false);
            }
        },
        [permission, isSyncingToken, registerDevice, unregisterDevice],
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

            unsubscribeOnMessage = onMessage(messaging, (payload) => {
                const title =
                    payload.notification?.title ||
                    payload.data?.title ||
                    "New Notification";
                const content =
                    payload.notification?.body || payload.data?.body || "";
                const targetUrl = payload.data?.url || "/";
                const parsedNotificationId = Number.parseInt(
                    payload.data?.notification_id || "0",
                    10,
                );

                setForegroundNotification({
                    title,
                    content,
                    url: targetUrl,
                    notificationId: Number.isNaN(parsedNotificationId)
                        ? 0
                        : parsedNotificationId,
                });
            });
        };

        initPush();

        // Cleanup foreground listener when unmounting or logging out
        return () => {
            unsubscribeOnMessage();
            if (permissionStatus) permissionStatus.onchange = null;
        };
    }, [user, isLoggedIn, syncToken, markNotificationAsSeen]);

    const dismissForegroundNotification = useCallback(() => {
        setForegroundNotification(null);
    }, []);

    const viewForegroundNotification = useCallback(async () => {
        if (!foregroundNotification) return;

        const { notificationId, url } = foregroundNotification;
        setForegroundNotification(null);

        if (notificationId) {
            queueMicrotask(async () => {
                try {
                    await markNotificationAsSeen({
                        notification_id: notificationId,
                    }).unwrap();
                } catch {
                    //
                }
            });
        }

        window.focus();
        window.location.href = url;
    }, [foregroundNotification, markNotificationAsSeen]);

    return {
        permission,
        isRequestingPermission,
        requestNotificationPermission,
        foregroundNotification,
        dismissForegroundNotification,
        viewForegroundNotification,
    };
}
