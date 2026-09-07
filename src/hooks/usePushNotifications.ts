import { useEffect, useCallback } from "react";
import { messaging, requestFcmToken } from "../utils/firebaseManager";
import { onMessage } from "firebase/messaging";
import {
    useRegisterDeviceMutation,
    useUnregisterDeviceMutation,
} from "../services/apis/user/UserAPIs";
import { useLogin } from "./useLogin";
import { useAppSelector } from "../services/redux/Hooks";

export function usePushNotifications() {
    const [registerDevice] = useRegisterDeviceMutation();
    const [unregisterDevice] = useUnregisterDeviceMutation();
    const isLoggedIn = useLogin();
    const user = useAppSelector((state) => state.user.user);

    const syncToken = useCallback(async () => {
        if (!("Notification" in window)) return;

        let permission = Notification.permission;

        if (permission === "default") {
            permission = await Notification.requestPermission();
        }

        if (permission === "granted") {
            const token = await requestFcmToken();
            if (token) {
                await registerDevice({ device_token: token }).unwrap();
                localStorage.setItem("fcm_token", token);
            }
        } else if (permission === "denied") {
            const savedToken = localStorage.getItem("fcm_token");
            if (savedToken) {
                await unregisterDevice({ device_token: savedToken }).unwrap();
                localStorage.removeItem("fcm_token");
            }
        }
    }, [registerDevice, unregisterDevice]);

    useEffect(() => {
        let unsubscribeOnMessage = () => {};

        const initPush = async () => {
            const loggedIn = await isLoggedIn();
            if (!loggedIn || !user) return;

            // 1. Sync token with backend
            await syncToken();

            // 2. Setup permissions change listener
            if ("permissions" in navigator) {
                navigator.permissions
                    .query({ name: "notifications" })
                    .then((status) => {
                        status.onchange = () => syncToken();
                    });
            }

            // 3. Listen for foreground FCM messages (Returns cleanup function)
            unsubscribeOnMessage = onMessage(messaging, (payload) => {
                const title =
                    payload.notification?.title ||
                    payload.data?.title ||
                    "New Notification";
                const body =
                    payload.notification?.body || payload.data?.body || "";
                const icon = payload.data?.icon || "/logo.png";
                const targetUrl = payload.data?.url || "/";

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
                        notification.close();
                    };
                }
            });
        };

        initPush();

        // Cleanup foreground listener when unmounting or logging out
        return () => {
            unsubscribeOnMessage();
        };
    }, [user, isLoggedIn, syncToken]);
}
