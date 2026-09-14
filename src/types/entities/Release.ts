import type { Version } from "./Version";
import type { ReleaseItem } from "./ReleaseItem";

export type Release = {
    id?: number;
    release_number?: string;
    title?: string;
    date?: string;
    details?: {
        description?: string | null;
    } | null;
    description?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    version?: number;
    release_version_id?: number;
    release_version?: Version | null;
    release_items?: ReleaseItem[] | null;
};
