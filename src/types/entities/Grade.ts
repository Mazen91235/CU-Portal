import type { Subject } from "./Subject";
import type { User } from "./User";

export type Grade = {
    id?: number;
    name?: string;
    type?: string;
    url?: string;
    subject?: Subject | null;
    subject_id?: number | null;
    author?: User | null;
    author_id?: number | null;
    parent?: Grade | null;
    parent_id?: number | null;
    details?: object;
    modified_at_iso?: string | null;
    modified_at?: string | null;
    created_at?: string | null;
};
