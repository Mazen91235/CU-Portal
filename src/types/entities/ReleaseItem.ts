import type { Release } from "./Release";

export type ReleaseItemType = "Feature" | "Improvement" | "Refactoring" | "Security Fix" | "Bug Fix";

export type ReleaseItem = {
    id?: number;
    item_type?: ReleaseItemType;
    content?: string;
    created_at?: string | null;
    updated_at?: string | null;
    release_id?: number;
    release?: Release | null;
    version?: number;
};