import { useState, useCallback } from "react";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { NotificationItem } from "../../../components/notifications/NotificationItem";
import {
    useLazyGetNotificationsQuery,
    useMarkNotificationAsSeenMutation,
} from "../../../services/apis/user/NotificationAPIs";
import type { NotificationResponseDto } from "../../../types/dtos/NotificationDtos";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { Pagination } from "../../../components/pagination/Pagination";
import styles from "./NotificationsPage.module.css";

export const NotificationsPage = () => {
    const [getNotifications, { isFetching }] = useLazyGetNotificationsQuery();
    const [markNotificationAsSeen] = useMarkNotificationAsSeenMutation();
    const [readPage, setReadPage] = useState(1);
    const [hasReadNextPage, setHasReadNextPage] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState<
        NotificationResponseDto[]
    >([]);
    const [readNotifications, setReadNotifications] = useState<
        NotificationResponseDto[]
    >([]);

    const fetchNotifications = useCallback(async () => {
        try {
            if (!unreadNotifications.length) {
                const unreadRes = await getNotifications({
                    data: { seen: false },
                    page: 1,
                    limit: Infinity,
                }).unwrap();
                setUnreadNotifications(unreadRes?.data || []);
            }
            const readRes = await getNotifications({
                data: { seen: true },
                page: readPage,
                limit: 50,
            }).unwrap();
            setHasReadNextPage(readRes.next_page || false);
            if (readPage === 1) {
                setReadNotifications(readRes?.data || []);
            } else {
                setReadNotifications((prev) => [
                    ...prev,
                    ...(readRes?.data || []),
                ]);
            }
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getNotifications, unreadNotifications, readPage]);

    const authQueryParams = useCallback(
        () => fetchNotifications(),
        [fetchNotifications],
    );

    useAuthQuery(authQueryParams);

    const handleMarkAsRead = async (notificationId?: number) => {
        if (!notificationId) return;
        try {
            await markNotificationAsSeen({
                notification_id: notificationId,
            }).unwrap();
            const notification = unreadNotifications.find(
                (n) => n.id === notificationId,
            );
            if (notification) {
                setUnreadNotifications((prev) =>
                    prev.filter((n) => n.id !== notificationId),
                );
                setReadNotifications((prev) => [notification, ...prev]);
            }
            showToast("success", "Success", "Notification marked as read");
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadNotifications.length === 0) {
            showToast("error", "Info", "No unread notifications");
            return;
        }
        try {
            const unreadIds = unreadNotifications.map((n) => n.id || 0) || [];
            await Promise.all(
                unreadIds.map((id) =>
                    markNotificationAsSeen({ notification_id: id }).unwrap(),
                ),
            );
            setReadNotifications(unreadNotifications.concat(readNotifications));
            setUnreadNotifications([]);
            showToast("success", "Success", "All notifications marked as read");
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handlePagination = () => {
        if (hasReadNextPage && !isFetching && readNotifications.length > 0) {
            setReadPage(readPage + 1);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Notifications - CU Portal"
                description="View and manage your notifications from CU Portal"
            />
            <div className={styles.notificationsContainer}>
                <div className={styles.headerSection}>
                    <div>
                        <h1 className={styles.pageTitle}>All Notifications</h1>
                        <div className={styles.unreadCount}>
                            You have {unreadNotifications.length} unread
                            notification
                            {unreadNotifications.length === 1 ? "" : "s"}
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.markAllReadBtn}
                            onClick={handleMarkAllAsRead}
                            disabled={unreadNotifications.length === 0}
                        >
                            Mark All As Read
                        </button>
                    </div>
                </div>

                <section className={styles.notificationsSection}>
                    <h2 className={styles.sectionTitle}>New Notifications</h2>
                    {unreadNotifications.length > 0 ? (
                        unreadNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                isUnread={true}
                                onMarkAsRead={() =>
                                    handleMarkAsRead(
                                        notification.id ?? undefined,
                                    )
                                }
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            No new notifications
                        </div>
                    )}
                </section>

                <section className={styles.notificationsSection}>
                    <h2 className={styles.sectionTitle}>Read Notifications</h2>
                    {readNotifications.length > 0 ? (
                        readNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                isUnread={false}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            No read notifications
                        </div>
                    )}
                </section>
                <Pagination onReached={handlePagination} />
            </div>
        </Layout>
    );
};
