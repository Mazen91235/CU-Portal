import type { ToastData, ToastListener } from "../types/props/ToastProps";
import { isPlatformSuspended } from "./PlatformStatus";

let toastListeners: ToastListener[] = [];

export function subscribeToToasts(listener: ToastListener): () => void {
    toastListeners.push(listener);
    return () => {
        toastListeners = toastListeners.filter((l) => l !== listener);
    };
}

export function showToast(
    type: "success" | "error",
    title: string,
    message: string
): void {
    if (isPlatformSuspended()) return;

    const toast: ToastData = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        title,
        message,
    };

    toastListeners.forEach((listener) => listener(toast));
}
