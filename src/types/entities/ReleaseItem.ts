import type { Release } from "./Release";

export type ReleaseItem = {
    id?: number;
    item_type?:
        | "Feature"
        | "Enhancement"
        | "Refactoring"
        | "Security Fix"
        | "Bug Fix";
    content?: string;
    created_at?: string | null;
    updated_at?: string | null;
    release_id?: number;
    release?: Release | null;
};
