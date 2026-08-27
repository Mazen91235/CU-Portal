import type { RoleResponseDto } from "./RoleDtos";

export type ExactRoleResponseDto = {
    id?: number | null;
    name?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    roles?: RoleResponseDto[] | null;
};
