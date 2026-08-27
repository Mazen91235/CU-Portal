import type { Role } from "./Role";
import type { ExactRole } from "./ExactRole";

export type RoleLink = {
    id?: number;
    created_at?: Date | null;
    updated_at?: Date | null;
    role_id?: number;
    role?: Role | null;
    exact_role_id?: number;
    exact_role?: ExactRole | null;
};
