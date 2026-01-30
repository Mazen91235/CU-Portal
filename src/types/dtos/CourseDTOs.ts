import type { SearchDto } from "./SearchDTOs";

export type CourseSearchDto = {
    faculty_id?: number;
    department_id?: number;
    semester_id?: number;
    year_id?: number;
} & SearchDto;
