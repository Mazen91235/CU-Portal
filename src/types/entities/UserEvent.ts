import type { User } from "./User";
import type { Event } from "./Event";

export type UserEvent = {
    id?: number;
    created_at?: string | null;
    updated_at?: string | null;
    user_id?: number;
    user?: User | null;
    event_id?: number;
    event?: Event | null;
};
