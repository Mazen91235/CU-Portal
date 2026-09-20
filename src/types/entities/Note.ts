import type { User } from "./User";

export type Note = {
    id?: number;
    title?: string;
    content?: string;
    date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    author_id?: number | null;
    author?: User | null;
};
