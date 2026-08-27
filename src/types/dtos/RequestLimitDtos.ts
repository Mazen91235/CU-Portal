import type { SearchDto } from "./BaseDtos";

export type RequestLimitSearchDto = {
    id?: number | null;
    ip?: string | null;
    route?: string | null;
    status?: boolean | null;
    user_id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
