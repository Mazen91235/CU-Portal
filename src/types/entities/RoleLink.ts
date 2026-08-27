import type { Role } from "./Role";
import type { ExactRole } from "./ExactRole";

export type RoleLink = {
    id?: number;
    created_at?: string | null;
    updated_at?: string | null;
    role_id?: number;
    role?: Role | null;
    exact_role_id?: number;
    exact_role?: ExactRole | null;
};
