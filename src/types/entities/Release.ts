import type { Version } from "./Version";
import type { ReleaseItem } from "./ReleaseItem";

export type Release = {
    id?: number;
    release_number?: string;
    title?: string;
    date?: Date;
    created_at?: Date | null;
    updated_at?: Date | null;
    version_id?: number;
    version?: Version | null;
    release_items?: ReleaseItem[] | null;
};
