import type { User } from "./User";

export type RequestLimit = {
    id?: number;
    ip?: string | null;
    route?: string | null;
    status?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    user_id?: number | null;
    user?: User | null;
};
