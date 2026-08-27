import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { FacultyResponseDto } from "./FacultyDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { SearchDto } from "./BaseDtos";

export type TaskCreateDto = {
    name: string;
    url?: string | null;
    deadline: string;
    subject_id: number;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    urls?: string[];
    links?: Record<string, string>[];
    details?: object;
};

export type TaskResponseDto = {
    id?: number | null;
    name?: string | null;
    task_type?: string | null;
    url?: string | null;
    urls?: string[] | null;
    links?: Record<string, string>[] | null;
    details?: object | null;
    deadline?: string | null;
    due_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
};

export type TaskUpdateDto = {
    name: string;
    url?: string | null;
    deadline: string;
    subject_id: number;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    urls?: string[];
    links?: Record<string, string>[];
    details?: object;
};

export type TaskDeleteDto = {
    id: number;
};

export type TaskSearchDto = {
    id?: number | null;
    subject_id?: number | null;
    author_id?: number | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    deadline_from?: string | null;
    deadline_to?: string | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
