import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { AttachmentResponseDto } from "./AttachmentDtos";
import type { SearchDto } from "./BaseDtos";
import type { TaskDetails } from "../entities/Task";

export type TaskCreateDto = {
    name: string;
    url?: string | null;
    deadline: Date;
    subject_id: number;
    details?: TaskDetails;
};

export type TaskResponseDto = {
    id?: number | null;
    name?: string | null;
    task_type?: string | null;
    url?: string | null;
    details?: TaskDetails | null;
    deadline?: Date | null;
    due_date?: Date | null;
    created_at?: Date | null;
    updated_at?: Date | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    attachments?: AttachmentResponseDto[] | null;
};

export type TaskUpdateDto = {
    name: string;
    url?: string | null;
    deadline: Date;
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
    deadline_from?: Date | null;
    deadline_to?: Date | null;
    created_at_from?: Date | null;
    created_at_to?: Date | null;
    updated_at_from?: Date | null;
    updated_at_to?: Date | null;
} & SearchDto;
