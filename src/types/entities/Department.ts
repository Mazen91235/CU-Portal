import type { Faculty } from "./Faculty";
import type { User } from "./User";
import type { Subject } from "./Subject";
import type { Task } from "./Task";
import type { Announcement } from "./Announcement";
import type { Week } from "./Week";
import type { Event } from "./Event";

export type Department = {
    id?: number;
    name?: string;
    code?: string | null;
    details?: object;
    study_type?: DepartmentStudyType;
    created_at?: Date | null;
    updated_at?: Date | null;
    faculty_id?: number | null;
    faculty?: Faculty | null;
    users?: User[] | null;
    subjects?: Subject[] | null;
    tasks?: Task[] | null;
    announcements?: Announcement[] | null;
    weeks?: Week[] | null;
    events?: Event[] | null;
};

export type DepartmentStudyType = "Mainstream" | "Credit" | "Both" | "" | null;
