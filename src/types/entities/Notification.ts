import type { User } from "./User";
import type { UserNotification } from "./UserNotification";

export type Notification = {
    id?: number;
    content?: string;
    notification_type?: NotificationType;
    parent_id?: number | null;
    url?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    users?: User[] | null;
    user_notifications?: UserNotification[] | null;
};

export type NotificationType =
    | "task"
    | "exam"
    | "announcement"
    | "material"
    | null;
