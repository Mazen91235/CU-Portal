import type { User } from "./User";
import type { Attachment } from "./Attachment";

export type PendingUser = {
    id?: number;
    url?: string;
    created_at?: Date | null;
    updated_at?: Date | null;
    user_id?: number;
    user?: User | null;
    attachment?: Attachment | null;
};
