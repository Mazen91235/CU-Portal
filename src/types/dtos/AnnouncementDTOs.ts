import type { SearchDto } from "./SearchDTOs";

export type AnnouncementSearchDto = {
    subject_id?: number | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    author_id?: number | null;
} & SearchDto;
