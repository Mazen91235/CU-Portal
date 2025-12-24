import type { ExactRole } from "./ExactRole";
import type { Role } from "./Role";

export type RoleLink = {
    id?: number;
    role?: Role | null;
    role_id?: number | null;
    exact_role?: ExactRole | null;
    exact_role_id?: number | null;
};
