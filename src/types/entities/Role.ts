import type { User } from "./User";
import type { ExactRole } from "./ExactRole";
import type { RoleLink } from "./RoleLink";

export type Role = {
    id?: number;
    name?: string;
    level?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    users?: User[] | null;
    exact_roles?: ExactRole[] | null;
    role_links?: RoleLink[] | null;
};
