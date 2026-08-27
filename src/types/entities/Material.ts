import type { Subject } from "./Subject";
import type { FileData } from "./Task";
import type { User } from "./User";
import type { Week } from "./Week";
import type { Attachment } from "./Attachment";

export type Material = {
    id?: number;
    name?: string | null;
    material_type?: MaterialType;
    url?: string | null;
    details?: {
        file_data?: FileData;
        fetched?: boolean;
    };
    created_at?: Date | null;
    updated_at?: Date | null;
    subject_id?: number | null;
    subject?: Subject | null;
    author_id?: number | null;
    author?: User | null;
    parent_id?: number | null;
    parent?: Material | null;
    children?: Material[] | null;
    week_id?: number | null;
    week?: Week | null;
    attachment?: Attachment | null;
};

export type MaterialType = "file" | "folder" | "drive" | "youtube" | "external";