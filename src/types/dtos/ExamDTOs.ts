import type { SearchDto } from "./SearchDTOs";

export type ExamSearchDto = {
    title?: string;
    subject_id?: number;
    faculty_id?: number;
    department_id?: number;
    year_id?: number;
    author_id?: number;
    start_date?: string;
    end_date?: string;
} & SearchDto;

export type ExamRegisterDto = {
    title?: string;
    description?: string;
    instructions?: string;
    due_date?: string;
    start_time?: string;
    location?: string;
    duration?: number;
    exam_type?: string;
    exam_format?: string;
    exam_weight?: number;
    subject_id?: number;
};