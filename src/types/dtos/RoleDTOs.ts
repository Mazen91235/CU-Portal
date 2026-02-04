import type { Role } from "../entities/Role";
import type { SearchDto } from "./SearchDTOs";

export type RoleSearchDto = {
    year?: number;
} & SearchDto;

export type RoleDto = {
    role?: Role;
    permissions?: string[];
};
