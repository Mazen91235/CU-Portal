import type { User } from "./User";
import type { Year } from "./Year";
import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { Subject } from "./Subject";
import type { Attachment } from "./Attachment";

export type LinkData = {
    title: string;
    url: string;
};

export type TaskDetails = {
    description?: string;
    instructions?: string;
    location?: string;
    exam_type?: string;
    exam_format?: "MCQ" | "Written" | "Mixed" | "Practical" | "Oral" | "Other";
    exam_weight?: string;
    duration?: number;
    urls?: string[] | null;
    links?: LinkData[] | null;
};

export type Task = {
    id?: number;
    name?: string | null;
    task_type?: string | null;
    url?: string | null;
    details?: Omit<TaskDetails, 'urls' | 'links'> | null;
    deadline?: Date;
    due_date?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
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
