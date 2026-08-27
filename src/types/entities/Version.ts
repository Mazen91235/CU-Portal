import type { Release } from "./Release";

export type Version = {
    id?: number;
    version_number?: number;
    created_at?: Date | null;
    updated_at?: Date | null;
    releases?: Release[] | null;
};
