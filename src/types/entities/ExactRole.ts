import type { Role } from "./Role";
import type { RoleLink } from "./RoleLink";

export type ExactRole = {
    id?: number;
    name?: string;
    created_at?: Date | null;
    updated_at?: Date | null;
    roles?: Role[] | null;
    role_links?: RoleLink[] | null;
};
