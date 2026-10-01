import type { User } from "./User";
import type { Department } from "./Department";
import type { Announcement } from "./Announcement";
import type { Subject } from "./Subject";
import type { Event } from "./Event";

export type Faculty = {
    id?: number;
    name?: string;
    details?: object;
    created_at?: string | null;
    updated_at?: string | null;
    users?: User[] | null;
    departments?: Department[] | null;
    announcements?: Announcement[] | null;
    subjects?: Subject[] | null;
    events?: Event[] | null;
};
