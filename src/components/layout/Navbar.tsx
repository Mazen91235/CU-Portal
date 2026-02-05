import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAppSelector } from "../../services/redux/Hooks";
import { Avatar } from "../avatar/Avatar";
import { formatDateTime } from "../../utils/Formatter";
import menuIcon from "../../assets/icons/menu-icon.svg";
import notificationIcon from "../../assets/icons/notification-icon.svg";
import styles from "./Navbar.module.css";
import { useMarkNotificationAsSeenMutation } from "../../services/apis/user/NotificationAPIs";
import { handlePopupErrors } from "../../utils/ErrorHandling";

export const Navbar = ({
    isOpen,
    onMenuToggle,
}: {
    isOpen: boolean;
    onMenuToggle: () => void;
}) => {
    const navigate = useNavigate();
    const [markNotificationsAsSeen] = useMarkNotificationAsSeenMutation();
    const [showNotifications, setShowNotifications] = useState(false);
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
            await markNotificationsAsSeen({ notification_id }).unwrap();
        } catch (error) {
            handlePopupErrors(error);
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
                        <img src={menuIcon} alt="" width="24" height="24" />
                    </button>
                </div>

                <div className={styles.rightSection}>
                    <div className={styles.iconsContainer}>
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
                            >
                                <img
                                    src={notificationIcon}
                                    alt=""
                                    width="24"
                                    height="24"
                                />
                                {notifications.length > 0 && (
                                    <span className={styles.badge}>
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className={styles.notificationsDropdown}>
                                    <h4 className={styles.dropdownTitle}>
                                        Notifications
                                    </h4>
                                    <div className={styles.notificationsList}>
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`${styles.notificationItem}`}
                                            >
                                                <Link
                                                    to={notification.url || "#"}
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
                                        ))}
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
