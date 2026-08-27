import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { FacultyResponseDto } from "./FacultyDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { SearchDto } from "./BaseDtos";
import type { FileData } from "../entities/Task";

export type FileDataWithExisting = FileData & {
    url?: string;
    isExisting?: boolean;
};

export type LinkData = {
    title: string;
    url: string;
};

export type TaskDetails = {
    description?: string;
    instructions?: string;
    location?: string;
    exam_type?: string;
    exam_format?: "MCQ" | "Written" | "Mixed" | "Practical" | "Oral" | "Other";
    exam_weight?: string;
    duration?: number;
    files_data?: FileData[];
};

export type TaskCreateDto = {
    name: string;
    url?: string | null;
    deadline: Date;
    subject_id: number;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    urls?: string[];
    links?: LinkData[];
    details?: TaskDetails;
};

export type TaskResponseDto = {
    id?: number | null;
    name?: string | null;
    task_type?: string | null;
    url?: string | null;
    urls?: string[] | null;
    links?: LinkData[] | null;
    details?: TaskDetails | null;
    deadline?: Date | null;
    due_date?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
};

export type TaskUpdateDto = {
    name: string;
    url?: string | null;
    deadline: Date;
    subject_id: number;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    urls?: string[];
    links?: LinkData[];
    details?: TaskDetails;
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
    deadline_from?: Date | null;
    deadline_to?: Date | null;
    created_at_from?: Date | null;
    created_at_to?: Date | null;
    updated_at_from?: Date | null;
    updated_at_to?: Date | null;
} & SearchDto;
