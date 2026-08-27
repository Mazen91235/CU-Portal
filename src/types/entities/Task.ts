import type { User } from "./User";
import type { Year } from "./Year";
import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { Subject } from "./Subject";
import type { Attachment } from "./Attachment";

export type FileData = {
    id?: string;
    name?: string;
    mime_type?: string;
    file_type?: string;
    size?: string;
    web_content_link?: string;
    web_view_link?: string;
};

export type LinkData = {
    title: string;
    url: string;
};

export type Task = {
    id?: number;
    name?: string | null;
    task_type?: string | null;
    urls?: string[] | null;
    links?: Record<string, string>[] | null;
    url?: string | null;
    details?: {
        description?: string;
        instructions?: string;
        location?: string;
        exam_type?: string;
        exam_format?:
            | "MCQ"
            | "Written"
            | "Mixed"
            | "Practical"
            | "Oral"
            | "Other";
        exam_weight?: string;
        duration?: number;
        files_data?: FileData[];
    };
    deadline?: string;
    due_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    year_id?: number | null;
    year?: Year | null;
    department_id?: number | null;
    department?: Department | null;
    faculty_id?: number | null;
    faculty?: Faculty | null;
    subject_id?: number | null;
    subject?: Subject | null;
    author_id?: number;
    author?: User | null;
    attachments?: Attachment[] | null;
};
