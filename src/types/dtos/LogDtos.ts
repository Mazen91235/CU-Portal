import type { UserResponseDto } from "./UserDtos";
import type { SearchDto } from "./BaseDtos";

export type LogResponseDto = {
    id?: number | null;
    action?: string | null;
    entity?: string | null;
    level?: string | null;
    response_code?: number | null;
    message?: string | null;
    details?: object | null;
    source?: string | null;
    route?: string | null;
    ip?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    user?: UserResponseDto | null;
};

export type LogSearchDto = {
    id?: number | null;
    action?: string | null;
    entity?: string | null;
    level?: string | null;
    response_code?: number | null;
    source?: string | null;
    route?: string | null;
    ip?: string | null;
    user_id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
