import type { User } from "./User";
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
    details?: Omit<TaskDetails, "urls" | "links"> | null;
    deadline?: string;
    due_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    subject_id?: number | null;
    subject?: Subject | null;
    author_id?: number;
    author?: User | null;
    attachments?: Attachment[] | null;
};
