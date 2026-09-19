import { formatString } from "../../utils/Formatter";
import styles from "./ForegroundNotification.module.css";

type ForegroundNotificationData = {
    title: string;
    content: string;
};

type ForegroundNotificationProps = {
    notification: ForegroundNotificationData | null;
    onView: () => void;
    onDismiss: () => void;
};

export const ForegroundNotification = ({
    notification,
    onView,
    onDismiss,
}: ForegroundNotificationProps) => {
    if (!notification) return null;

    return (
        <aside className={styles.container} role="status" aria-live="polite">
            <div className={styles.accent} aria-hidden="true" />
            <div className={styles.iconWrapper} aria-hidden="true">
                <i className="fa-solid fa-bell"></i>
            </div>

            <div className={styles.content}>
                <div className={styles.label}>New Notification</div>
                <div className={styles.title}>
                    {formatString(notification.title, "CardTitle")}
                </div>
                {notification.content && (
                    <div className={styles.message}>
                        {formatString(notification.content, "Content")}
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.viewButton}
                        onClick={onView}
                    >
                        View
                        <i
                            className={`fa-solid fa-arrow-right ${styles.viewIcon}`}
                        ></i>
                    </button>
                </div>
            </div>

            <button
                type="button"
                className={styles.closeButton}
                onClick={onDismiss}
                aria-label="Dismiss notification"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
        </aside>
    );
};
