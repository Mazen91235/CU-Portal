import type { Roadmap } from "../entities/Roadmap";
import type { Subject } from "../entities/Subject";
import type { SearchDto } from "./SearchDTOs";

export type CourseMapResponseDto = {
    roadmap?: Roadmap | null;
    courses?: Subject[][][] | null;
    courses_count?: number | null;
};

export type CourseMapSearchDto = {
    facultyId?: string;
    department_id?: string;
    year_id?: string;
} & SearchDto;

export type CourseMapRegisterDto = {
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    Years?: number| null;
    Terms?: number| null;
};

export type CourseMapUpdateYearsDto = {
    year_index?: number | null;
    year_name?: string | null;
};

export type CourseMapAddYearsDto = {
    year_name?: string | null;
    year_index?: number | null;
};

export type CourseMapAddCoursesDto = {
    subject_id?: number | null;
    year_index?: number | null;
    term?: number | null;
    rank?: number | null;
};