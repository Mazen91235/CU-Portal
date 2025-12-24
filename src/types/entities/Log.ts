import type { User } from "./User";

export type Log = {
    id?: number;
    ip?: string;
    level?: string;
    action?: string;
    entity?: string;
    response_code?: number | null;
    message?: string;
    details?: object;
    user?: User | null;
    route?: string;
    created_at?: string | null;
};
