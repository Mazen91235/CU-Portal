import type { UserResponseDto } from "./UserDtos";
import type { ExactRoleResponseDto } from "./ExactRoleDtos";
import type { SearchDto } from "./BaseDtos";

export type RoleCreateDto = {
    name: string;
};

export type RoleResponseDto = {
    id?: number | null;
    name?: string | null;
    level?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    users?: UserResponseDto[] | null;
    exact_roles?: ExactRoleResponseDto[] | null;
};

export type RoleUpdateDto = {
    name: string;
    permissions?: string[];
};

export type RoleDeleteDto = {
    id: number;
};

export type RoleSearchDto = {
    id?: number | null;
    name?: string | null;
    level?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
