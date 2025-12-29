import { useEffect, useState } from "react";
import { subscribeToToasts } from "../../utils/ToastsManager";
import type {
    ToastContainerProps,
    ToastData,
    ToastProps,
} from "../../types/props/ToastProps";
import styles from "./Toast.module.css";

const Toast = ({ toast, onRemove }: ToastProps) => {
    const [isHiding, setIsHiding] = useState(false);

    useEffect(() => {
        const hideTimer = setTimeout(() => {
            setIsHiding(true);
        }, 5000);

        const removeTimer = setTimeout(() => {
            onRemove(toast.id);
        }, 5300);

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, onRemove]);

    const handleClose = () => {
        setIsHiding(true);
        setTimeout(() => onRemove(toast.id), 300);
    };

    return (
        <div
            className={`${styles.toast} ${styles[toast.type]} ${
                isHiding ? styles.hiding : ""
            }`}
            onClick={handleClose}
        >
            <div className={styles.toastContent}>
                <div className={styles.toastIcon}>
                    {toast.type === "success" ? "✓" : "✕"}
                </div>
                <div className={styles.toastBody}>
                    <div className={styles.toastTitle}>{toast.title}</div>
                    <div className={styles.toastMessage}>{toast.message}</div>
                </div>
            </div>
            <div className={styles.progressBar}>
                <div className={styles.progressBarFill}></div>
            </div>
        </div>
    );
};

export const ToastContainer = ({ toast, onRemove }: ToastContainerProps) => {
    return (
        <div className={styles.toastContainer}>
            {toast && (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            )}
        </div>
    );
};

export const Toasts = () => {
    const [toast, setToast] = useState<ToastData | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToToasts((toast) => {
            setToast(toast);
        });
        return unsubscribe;
    }, []);

    const handleRemove = () => {
        setToast(null);
    };

    return <ToastContainer toast={toast} onRemove={handleRemove} />;
};
