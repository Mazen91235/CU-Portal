import type { Subject } from "./Subject";
import type { User } from "./User";
import type { Week } from "./Week";
import type { WeekItem } from "./WeekItem";
import type { Attachment } from "./Attachment";

export type Material = {
    id?: number;
    name?: string | null;
    material_type?: MaterialType;
    details?: object;
    created_at?: string | null;
    updated_at?: string | null;
    subject_id?: number | null;
    subject?: Subject | null;
    author_id?: number | null;
    author?: User | null;
    parent_id?: number | null;
    parent?: Material | null;
    children?: Material[] | null;
    weeks?: Week[] | null;
    week_items?: WeekItem[] | null;
    attachment?: Attachment | null;
};

export type MaterialType = "file" | "folder" | "drive" | "youtube" | "external";
