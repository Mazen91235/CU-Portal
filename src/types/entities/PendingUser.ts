import type { User } from "./User";
import type { Attachment } from "./Attachment";

export type PendingUser = {
    id?: number;
    created_at?: string | null;
    updated_at?: string | null;
    user_id?: number;
    user?: User | null;
    attachment?: Attachment | null;
};
