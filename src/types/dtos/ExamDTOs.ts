import type { SearchDto } from "./SearchDTOs";

export type ExamSearchDto = {
    subject_id?: number;
    start_date?: string;
    end_date?: string;
} & SearchDto;
