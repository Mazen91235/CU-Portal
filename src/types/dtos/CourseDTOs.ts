import type { SearchDto } from "./SearchDTOs";

export type CourseSearchDto = {
        facultyId?: string;
        department_id?: string;
        semester_id?: string;
        year_id?: string;
            } & SearchDto;
