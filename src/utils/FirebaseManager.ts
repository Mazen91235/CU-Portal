import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestFcmToken = async () => {
    if (!("serviceWorker" in navigator) || !("Notification" in window))
        return null;

    const permission = Notification.permission;
    if (permission !== "granted") return null;

    try {
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js",
        );
        const currentToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
            serviceWorkerRegistration: registration,
        });
        localStorage.setItem("fcm_token", currentToken || ""); // Store the token in localStorage
        return currentToken || null;
    } catch {
        // console.error("Error retrieving FCM token:", error);
        return null;
    }
};
