import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { Subject } from "./Subject";
import type { FileData, LinkData } from "./Task";
import type { User } from "./User";
import type { Year } from "./Year";

export type Announcement = {
    id?: number;
    title?: string;
    content?: string;
    date?: string;
    urls?: string[];
    links?: LinkData[];
    faculty?: Faculty | null;
    faculty_id?: number | null;
    department?: Department | null;
    department_id?: number | null;
    year?: Year | null;
    details?: {
        files_data?: FileData[];
    };
    created_at?: string | null;
    modified_at?: string | null;
    subject?: Subject | null;
    subject_id?: number | null;
    author?: User | null;
    author_id?: number | null;
};
