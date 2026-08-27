import type { User } from "./User";
import type { Department } from "./Department";
import type { Announcement } from "./Announcement";
import type { Task } from "./Task";
import type { Subject } from "./Subject";
import type { Event } from "./Event";
import type { Week } from "./Week";

export type Faculty = {
    id?: number;
    name?: string;
    details?: object;
    created_at?: string | null;
    updated_at?: string | null;
    users?: User[] | null;
    departments?: Department[] | null;
    announcements?: Announcement[] | null;
    tasks?: Task[] | null;
    subjects?: Subject[] | null;
    events?: Event[] | null;
    weeks?: Week[] | null;
};
