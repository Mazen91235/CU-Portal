import type { SearchDto } from "./SearchDTOs";

export type GradeSearchDto = {
    subject_id?: number;
    parent_id?: number;
} & SearchDto;

export type GradeRegisterDto = {
    name?: string | null;
    description?: string | null;
    url?: string | null;
    subject_id?: number | null;
    parent_id?: number | null;
};

