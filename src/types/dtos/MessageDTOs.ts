import type { SearchDto } from "./SearchDTOs";
export type MessageSearchDto = {
    date_from?: string;
    date_to?: string;
} & SearchDto;
