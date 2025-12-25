import type { SearchDto } from "./SearchDTOs";
export type LogSearchDto = {
    date_from?: string;
    date_to?: string;
    type?: string;
    action?: string;
    entity?: string;
    user_id?: number;
} & SearchDto;
