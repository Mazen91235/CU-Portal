import type { Role } from "./Role";
import type { RoleLink } from "./RoleLink";

export type ExactRole = {
    id?: number;
    name?: string;
    created_at?: string | null;
    updated_at?: string | null;
    roles?: Role[] | null;
    role_links?: RoleLink[] | null;
};
