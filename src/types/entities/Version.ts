import type { Release } from "./Release";

export type Version = {
    id?: number;
    version_number?: number;
    created_at?: string | null;
    updated_at?: string | null;
    releases?: Release[] | null;
    version?: number;
};