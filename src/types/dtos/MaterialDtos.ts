import type { SubjectResponseDto } from "./SubjectDtos";
import type { UserResponseDto } from "./UserDtos";
import type { SearchDto } from "./BaseDtos";
import type { FileData } from "./TaskDtos";

export type MaterialCreateDto = {
    name: string;
    material_type: string;
    url?: string | null;
    subject_id: number;
    parent_id?: number | null;
};

export type MaterialResponseDto = {
    id?: number | null;
    name?: string | null;
    material_type?: string | null;
    url?: string | null;
    details?: { file_data?: FileData; fetched?: boolean; folders_count?: number; files_count?: number } | null;
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    parent_id?: number | null;
    children?: MaterialResponseDto[] | null;
};

export type MaterialUpdateDto = {
    name: string;
    material_type: string;
    url?: string | null;
};

export type MaterialsDeleteDto = {
    material_ids: number[];
};

export type MaterialSearchDto = {
    id?: number | null;
    material_type?: string | null;
    subject_id?: number | null;
    parent_id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;

export type MaterialsCopyOrMoveDto = {
    material_ids: number[];
    destination_id?: number | null;
};

export type MaterialsFetchFromDriveDto = {
    url: string;
    subject_id?: number | null;
    parent_id?: number | null;
};