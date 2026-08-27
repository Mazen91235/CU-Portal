import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { Subject } from "./Subject";
import type { FileData, LinkData } from "./Task";
import type { User } from "./User";
import type { Year } from "./Year";
import type { Attachment } from "./Attachment";

export type Announcement = {
    id?: number;
    title?: string | null;
    content?: string | null;
    date?: Date | null;
    urls?: string[] | null;
    links?: LinkData[] | null;
    details?: {
        files_data?: FileData[];
    };
    created_at?: Date | null;
    updated_at?: Date | null;
    faculty_id?: number | null;
    faculty?: Faculty | null;
    department_id?: number | null;
    department?: Department | null;
    year_id?: number | null;
    year?: Year | null;
    author_id?: number | null;
    author?: User | null;
    subject_id?: number | null;
    subject?: Subject | null;
    attachments?: Attachment[] | null;
};
