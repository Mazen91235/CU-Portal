import type { User } from "./User";
import type { Subject } from "./Subject";
import type { Task } from "./Task";
import type { Announcement } from "./Announcement";
import type { Event } from "./Event";
import type { Week } from "./Week";

export type Year = {
    id?: number;
    year?: number;
    details?: object;
    created_at?: Date | null;
    updated_at?: Date | null;
    users?: User[] | null;
    subjects?: Subject[] | null;
    tasks?: Task[] | null;
    announcements?: Announcement[] | null;
    weeks?: Week[] | null;
    events?: Event[] | null;
};
