import type { User } from "./User";
import type { Event } from "./Event";

export type UserEvent = {
    id?: number;
    created_at?: Date | null;
    updated_at?: Date | null;
    user_id?: number;
    user?: User | null;
    event_id?: number;
    event?: Event | null;
};
