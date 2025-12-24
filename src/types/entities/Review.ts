import type { User } from "./User";

export type Review = {
    id?: number;
    content?: string;
    rating?: number;
    author?: User | null;
    author_id?: number | null;
    created_at?: string | null;
    created_at_full?: string | null;
};
