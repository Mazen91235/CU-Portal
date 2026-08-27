import type { User } from "./User";

export type RequestLimit = {
    id?: number;
    ip?: string | null;
    route?: string | null;
    status?: boolean | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    user_id?: number | null;
    user?: User | null;
};
