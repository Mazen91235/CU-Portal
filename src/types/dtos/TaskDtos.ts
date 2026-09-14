import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { AttachmentResponseDto } from "./AttachmentDtos";
import type { SearchDto } from "./BaseDtos";
import type { TaskDetails } from "../entities/Task";

export type TaskCreateDto = {
    name: string;
    url?: string | null;
    deadline: string;
    subject_id: number;
    details?: TaskDetails;
};

export type TaskResponseDto = {
    id?: number | null;
    name?: string | null;
    task_type?: string | null;
    url?: string | null;
    details?: TaskDetails | null;
    deadline?: string | null;
    due_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    attachments?: AttachmentResponseDto[] | null;
};

export type TaskUpdateDto = {
    name: string;
    url?: string | null;
    deadline: string;
    subject_id: number;
    details?: TaskDetails;
};

export type TaskDeleteDto = {
    id: number;
};

export type TaskSearchDto = {
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
