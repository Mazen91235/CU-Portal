import type { User } from "./User";
import type { Notification } from "./Notification";

export type UserNotification = {
    id?: number;
    seen?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    user_id?: number;
    user?: User | null;
    notification_id?: number;
    notification?: Notification | null;
};
