import { useState } from "react";
import { useAppSelector } from "../../services/redux/Hooks";
import styles from "./NotificationPermissionRequest.module.css";

type NotificationPermissionRequestProps = {
    permission: NotificationPermission;
    isRequesting: boolean;
    onEnable: () => void;
};

export const NotificationPermissionRequest = ({
    permission,
    isRequesting,
    onEnable,
}: NotificationPermissionRequestProps) => {
    const user = useAppSelector((state) => state.user.user);
    const [isDismissed, setIsDismissed] = useState(false);

    if (
        isDismissed ||
        !user ||
        !("Notification" in window) ||
        permission === "granted"
    ) {
        return null;
    }

    const isDenied = permission === "denied";

    return (
        <aside className={styles.container} role="status">
            <div className={styles.icon} aria-hidden="true">
                <i className="fa-solid fa-bell"></i>
            </div>
            <div className={styles.content}>
                <div className={styles.title}>Stay up to date</div>
                <div className={styles.message}>
                    {isDenied
                        ? "Notifications are blocked. Allow them in your browser settings to receive important updates."
                        : "Enable notifications to receive announcements and other important updates."}
                </div>
                <div className={styles.actions}>
                    {isDenied ? (
                        <button
                            type="button"
                            className={styles.button}
                            onClick={onEnable}
                            disabled={isRequesting}
                        >
                            Check Permission
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.button}
                            onClick={onEnable}
                            disabled={isRequesting}
                        >
                            {isRequesting
                                ? "Enabling..."
                                : "Enable Notifications"}
                        </button>
                    )}
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={() => setIsDismissed(true)}
                        aria-label="Dismiss notification reminder"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
        </aside>
    );
};
