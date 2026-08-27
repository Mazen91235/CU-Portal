import type { User } from "./User";
import type { Notification } from "./Notification";

export type UserNotification = {
    id?: number;
    seen?: boolean;
    created_at?: Date | null;
    updated_at?: Date | null;
    user_id?: number;
    user?: User | null;
    notification_id?: number;
    notification?: Notification | null;
};
