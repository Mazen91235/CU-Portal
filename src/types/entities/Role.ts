import type { User } from "./User";

export type Role = {
    id?: number;
    name?: string;
    level?: number;
    permissions?: string[];
    permissions_count?: number;
    users?: User[] | null;
    users_count?: number;
};
