import type { User } from "./User";

export type PendingUser = {
    id?: number;
    user?: User | null;
    url?: string;
};
