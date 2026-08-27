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
    created_at?: Date | null;
    updated_at?: Date | null;
    release_id?: number;
    release?: Release | null;
};
