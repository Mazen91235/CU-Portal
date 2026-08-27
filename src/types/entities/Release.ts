import type { Version } from "./Version";
import type { ReleaseItem } from "./ReleaseItem";

export type Release = {
    id?: number;
    release_number?: string;
    title?: string;
    date?: string;
    created_at?: string | null;
    updated_at?: string | null;
    version_id?: number;
    version?: Version | null;
    release_items?: ReleaseItem[] | null;
};
