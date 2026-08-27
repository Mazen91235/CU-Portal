import type { SearchDto } from "./BaseDtos";

export type FileSearchDto = {
    file_id: string;
} & SearchDto;
