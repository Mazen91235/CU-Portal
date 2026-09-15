import { formatString } from "../../utils/Formatter";
import { Link } from "react-router";
import type { NotificationResponseDto } from "../../types/dtos/NotificationDtos";
import { formatTimeAgo } from "../../utils/Formatter";
import notificationGrade from "../../assets/icons/notification-grade.svg";
import notificationReminder from "../../assets/icons/notification-reminder.svg";
import notificationMaterial from "../../assets/icons/notification-material.svg";
import notificationDue from "../../assets/icons/notification-due.svg";
import notificationDefault from "../../assets/icons/notification-icon.svg";
import styles from "./NotificationItem.module.css";

const getNotificationIcon = (type?: string | null): string => {
    switch (type) {
        case "grade":
            return notificationGrade;
        case "due":
            return notificationDue;
        case "material":
            return notificationMaterial;
        case "reminder":
            return notificationReminder;
        default:
            return notificationDefault;
    }
};

export const NotificationItem = ({
    notification,
    isUnread,
    onMarkAsRead,
}: {
    notification: NotificationResponseDto;
    isUnread: boolean;
    onMarkAsRead?: () => void;
}) => {
    return (
        <div className={styles.notificationCard}>
            <img
                src={getNotificationIcon(notification.notification_type)}
                alt={notification.notification_type || "notification"}
                className={styles.notificationIcon}
            />
            <div className={styles.notificationContent}>
                {notification.url ? (
                    <Link
                        to={notification.url}
                        target="_blank"
                        className={styles.notificationLink}
                    >
                        <div className={styles.notificationTitle}>
                            {formatString(notification.content, "CardDescription")}
                        </div>
                    </Link>
                ) : (
                    <div className={styles.notificationTitle}>
                        {formatString(notification.content, "CardDescription")}
                    </div>
                )}
                <div className={styles.notificationSubtitle}>
                    {formatTimeAgo(notification.created_at)}
                </div>
            </div>
            {isUnread ? (
                <div className={styles.notificationBtnRow}>
                    <button
                        className={styles.markReadBtn}
                        onClick={onMarkAsRead}
                    >
                        Mark As Read
                    </button>
                </div>
            ) : (
                notification.url && (
                    <div className={styles.notificationBtnRow}>
                        <Link to={notification.url} target="_blank">
                            <i className={`far fa-eye ${styles.eyeIcon}`}></i>
                        </Link>
                    </div>
                )
            )}
        </div>
    );
};
