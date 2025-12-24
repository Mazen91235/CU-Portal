import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { Subject } from "./Subject";
import type { User } from "./User";
import type { Year } from "./Year";

export type Announcement = {
    id?: number;
    title?: string;
    content?: string;
    urls?: string[];
    links?: string[];
    faculty?: Faculty | null;
    faculty_id?: number | null;
    department?: Department | null;
    department_id?: number | null;
    year?: Year | null;
    details?: object;
    created_at?: string | null;
    modified_at?: string | null;
    subject?: Subject | null;
    subject_id?: number | null;
    author?: User | null;
    author_id?: number | null;
};
