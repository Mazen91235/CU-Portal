// public/firebase-messaging-sw.js

// 1. Import Firebase scripts for Service Worker
importScripts(
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js",
);

// 2. Initialize Firebase in the Service Worker
// Replace these with your actual Firebase project config values
const firebaseConfig = {
    apiKey: "AIzaSyACbJxx6yJ8pu1_6GdozMd_f3T8t0VGj8M",
    authDomain: "students-portal-cu.firebaseapp.com",
    projectId: "students-portal-cu",
    storageBucket: "students-portal-cu.firebasestorage.app",
    messagingSenderId: "171239685263",
    appId: "1:171239685263:web:8d6d1d532f49050d6904fa",
    measurementId: "G-HPMHKX9VYK",
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// 3. Handle Background Messages (Tab closed or backgrounded)
messaging.onBackgroundMessage((payload) => {
    const title =
        payload.notification?.title ||
        payload.data?.title ||
        "New Notification";
    const options = {
        body: payload.notification?.body || payload.data?.body || "",
        icon:
            payload.webpush?.notification?.icon ||
            payload.notification?.icon ||
            payload.data?.icon ||
            "/logo.png",
        data: {
            url: payload.fcmOptions?.link || payload.data?.url || "/",
        },
    };

    self.registration.showNotification(title, options);
});

// 4. Handle Notification Click (Focus or open URL)
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || "/";
    const notificationId = parseInt(
        event.notification.data?.notification_id || "0",
    );

    if (notificationId) {
        (async () => {
            let backendUrl = "https://api-cu-portal-dev.vercel.app";
            if (!window.location.origin.includes("dev"))
                backendUrl = "https://api.cu-portal.com";
            await fetch(`${backendUrl}/user/notifications/${notificationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
                credentials: "include",
            });
        })();
    }

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((windowClients) => {
                // If a tab with the target URL is already open, focus it
                for (const client of windowClients) {
                    if (client.url === targetUrl && "focus" in client) {
                        return client.focus();
                    }
                }
                // Otherwise, open a new browser tab/window
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            }),
    );
});
