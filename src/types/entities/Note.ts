import type { User } from "./User";

export type Note = {
    id?: number;
    title?: string;
    content?: string;
    date?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    author_id?: number | null;
    author?: User | null;
};
