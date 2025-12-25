import type { SearchDto } from "./SearchDTOs";
export type TaskSearchDto = {
    title?: string;
    subject_id?: number;
    faculty_id?: number;
    department_id?: number;
    year_id?: number;
    author_id?: number;
    start_date?: string;
    end_date?: string;
} & SearchDto;

export type TaskRegisterDto = {
    title?: string;
    description?: string;
    submission_url?: string;
    deadline?: string;
    subject_id?: number;
    urls?: string[];
    links?: { title: string; url: string }[];
};
