import type { User } from "./User";

export type UserNotification = {
    id?: number;
    user?: User | null;
    user_id?: number | null;
    notification?: Notification | null;
    notification_id?: number | null;
    seen?: boolean;
};
