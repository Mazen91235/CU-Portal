import type { Faculty } from "./Faculty";
import type { User } from "./User";
import type { Subject } from "./Subject";
import type { Announcement } from "./Announcement";
import type { Event } from "./Event";

export type Department = {
    id?: number;
    name?: string;
    code?: string | null;
    details?: object;
    study_type?: DepartmentStudyType;
    created_at?: string | null;
    updated_at?: string | null;
    faculty_id?: number | null;
    faculty?: Faculty | null;
    users?: User[] | null;
    subjects?: Subject[] | null;
    announcements?: Announcement[] | null;
    events?: Event[] | null;
};

export type DepartmentStudyType = "Mainstream" | "Credit" | "Both" | "" | null;
