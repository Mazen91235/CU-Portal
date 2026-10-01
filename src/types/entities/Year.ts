import type { User } from "./User";
import type { Subject } from "./Subject";
import type { Announcement } from "./Announcement";
import type { Event } from "./Event";

export type Year = {
    id?: number;
    year?: number;
    details?: object;
    created_at?: string | null;
    updated_at?: string | null;
    users?: User[] | null;
    subjects?: Subject[] | null;
    announcements?: Announcement[] | null;
    events?: Event[] | null;
};
