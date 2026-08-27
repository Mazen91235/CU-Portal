import type { User } from "./User";

export type Log = {
    id?: number;
    action?: string | null;
    entity?: string | null;
    level?: string;
    response_code?: number;
    message?: string | null;
    details?: object;
    source?: string | null;
    route?: string | null;
    ip?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    user_id?: number | null;
    user?: User | null;
};
