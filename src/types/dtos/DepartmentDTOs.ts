import type { SearchDto } from "./SearchDTOs";
export type DepartmentSearchDto = {
    name?: string;
    faculty_id?: number;
    study_type?: string;
} & SearchDto;
