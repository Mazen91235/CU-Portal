import type { Subject } from "./Subject";
import type { FileData } from "./Task";
import type { User } from "./User";

export type Material = {
    id?: number;
    name?: string;
    type?: string;
    url?: string;
    subject?: Subject | null;
    subject_id?: number | null;
    author?: User | null;
    author_id?: number | null;
    parent?: Material | null;
    parent_id?: number | null;
    details?: {
        description?: string;
        file_data?: FileData;
        fetched?: boolean;
        folders_count?: number;
        files_count?: number;
    };
    modified_at_iso?: string | null;
    modified_at?: string | null;
    created_at?: string | null;
};
