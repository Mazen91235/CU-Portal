import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAppSelector } from "../../services/redux/Hooks";
import { Avatar } from "../avatar/Avatar";
import { formatDateTime } from "../../utils/Formatter";
import IconComponent from "../IconComponent";
import styles from "./Navbar.module.css";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import { showToast } from "../../utils/ToastsManager";
import {
    useLazyGetNotificationsQuery,
    useMarkNotificationsAsSeenMutation,
} from "../../services/apis/user/NotificationAPIs";

export const Navbar = ({
    isOpen,
    onMenuToggle,
}: {
    isOpen: boolean;
    onMenuToggle: () => void;
}) => {
    const [getNotifications] = useLazyGetNotificationsQuery();
    const navigate = useNavigate();
    const [markNotificationsAsSeen] = useMarkNotificationsAsSeenMutation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [isMarkingAsSeen, setIsMarkingAsSeen] = useState(false);

    const notifications = useAppSelector(
        (state) => state.notification.notifications,
    );

    const user = useAppSelector((state) => state.user.user);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification_id: number) => {
        try {
            setIsMarkingAsSeen(true);
            await markNotificationsAsSeen({
                notification_ids: [notification_id],
            }).unwrap();
            await getNotifications({
                data: { seen: false },
                order_by: ["id"],
                descending: true,
                page: 1,
                limit: 1e6,
            }).unwrap();
        } catch (error) {
            handlePopupErrors(error);
        } finally {
            setIsMarkingAsSeen(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (notifications.length === 0) {
            showToast("error", "Info", "No unread notifications");
            return;
        }
        try {
            setIsMarkingAsSeen(true);
            const unreadIds = notifications.map((n) => n.id || 0) || [];
            await markNotificationsAsSeen({
                notification_ids: unreadIds,
            }).unwrap();
            await getNotifications({
                data: { seen: false },
                order_by: ["id"],
                descending: true,
                page: 1,
                limit: 1e6,
            }).unwrap();
            showToast("success", "Success", "All notifications marked as read");
        } catch (error) {
            handlePopupErrors(error);
        } finally {
            setIsMarkingAsSeen(false);
        }
    };

    const handleViewAllNotifications = () => {
        setShowNotifications(false);
        navigate("/user/notifications");
    };

    return (
        <nav
            className={`${styles.navbar} ${isOpen ? styles.navbarShifted : ""}`}
        >
            <div className={styles.container}>
                <div className={styles.leftSection}>
                    <button
                        onClick={onMenuToggle}
                        className={styles.menuBtn}
                        aria-label="Toggle menu"
                    >
                        <IconComponent icon="menu" size="24" color="#5A0F61" />
                    </button>
                </div>

                <div className={styles.rightSection}>
                    <div className={styles.iconsContainer}>
                        <Link
                            to="https://wa.me/+201281518436"
                            className={styles.iconButton}
                            aria-label="Help & Support"
                            title="Help & Support"
                        >
                            <IconComponent icon="help" size="24" />
                        </Link>
                        <div
                            className={styles.notificationWrapper}
                            ref={notificationRef}
                        >
                            <button
                                onClick={() =>
                                    setShowNotifications(!showNotifications)
                                }
                                className={styles.iconButton}
                                aria-label="Notifications"
                                title="Notifications"
                            >
                                <IconComponent icon="notification" size="24" />

                                {notifications.length > 0 && (
                                    <span className={styles.badge}>
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className={styles.notificationsDropdown}>
                                    <div className={styles.dropDown}>
                                        <h4 className={styles.dropdownTitle}>
                                            Notifications
                                        </h4>
                                        <button
                                            className={styles.markAllReadBtn}
                                            onClick={handleMarkAllAsRead}
                                            disabled={
                                                notifications.length === 0 ||
                                                isMarkingAsSeen
                                            }
                                            title="Mark All As Read"
                                        >
                                            <IconComponent
                                                icon="checkmark-done"
                                                size="16"
                                            />
                                        </button>
                                    </div>
                                    <div className={styles.notificationsList}>
                                        {notifications.length === 0 ? (
                                            <div
                                                className={
                                                    styles.notificationItem
                                                }
                                            >
                                                <small>No notifications</small>
                                            </div>
                                        ) : (
                                            notifications.map(
                                                (notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`${styles.notificationItem}`}
                                                    >
                                                        <Link
                                                            to={
                                                                notification.url ||
                                                                "#"
                                                            }
                                                            onClick={() =>
                                                                handleNotificationClick(
                                                                    notification.id!,
                                                                )
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    styles.notificationContent
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.notificationTitle
                                                                    }
                                                                >
                                                                    {
                                                                        notification.content
                                                                    }
                                                                </div>
                                                                <div
                                                                    className={
                                                                        styles.notificationMeta
                                                                    }
                                                                >
                                                                    <br />
                                                                    <small>
                                                                        {formatDateTime(
                                                                            notification.created_at ||
                                                                                "",
                                                                        )}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                ),
                                            )
                                        )}
                                    </div>
                                    <div className={styles.dropdownFooter}>
                                        <button
                                            className={styles.viewAllBtn}
                                            onClick={handleViewAllNotifications}
                                        >
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            to="/user/settings/profile"
                            className={styles.profileLink}
                        >
                            <Avatar user={user} size="medium" />
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
