import type { User } from "./User";
import type { Event } from "./Event";

export type EventUser = {
    id?: number;
    user?: User | null;
    user_id?: number | null;
    event?: Event | null;
    event_id?: number | null;
};
