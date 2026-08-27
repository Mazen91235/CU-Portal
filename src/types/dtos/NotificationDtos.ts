import type { NotificationType } from "../entities/Notification";

export type NotificationResponseDto = {
    id?: number | null;
    content?: string | null;
    notification_type?: NotificationType | null;
    parent_id?: number | null;
    url?: string | null;
    created_at?: string | null;
};
