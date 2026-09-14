import type { TaskDetails } from "../entities/Task";
import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { SearchDto } from "./BaseDtos";

export type ExamCreateDto = {
    name: string;
    deadline: string;
    subject_id: number;
    details?: TaskDetails;
};

export type ExamResponseDto = {
    id?: number | null;
    name?: string | null;
    task_type?: string | null;
    deadline?: string | null;
    due_date?: string | null;
    details?: TaskDetails | null;
    created_at?: string | null;
    updated_at?: string | null;
    subject?: SubjectResponseDto | null;
    author?: UserResponseDto | null;
};

export type ExamUpdateDto = {
    name: string;
    deadline: string;
    subject_id: number;
    details?: TaskDetails;
};

export type ExamDeleteDto = {
    id: number;
};

export type ExamSearchDto = {
    id?: number | null;
    subject_id?: number | null;
    author_id?: number | null;
    deadline_from?: string | null;
    deadline_to?: string | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
