import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { Subject } from "./Subject";
import type { User } from "./User";
import type { Year } from "./Year";

export type Task = {
    id?: number;
    name?: string;
    urls?: string[];
    url?: string;
    links?: string[];
    type?: string;
    faculty?: Faculty | null;
    faculty_id?: number | null;
    department?: Department | null;
    department_id?: number | null;
    year?: Year | null;
    year_id?: number | null;
    details?: object;
    deadline?: string | null;
    due_date?: string | null;
    modified_at?: string | null;
    subject?: Subject | null;
    subject_id?: number | null;
    author?: User | null;
    author_id?: number | null;
};
