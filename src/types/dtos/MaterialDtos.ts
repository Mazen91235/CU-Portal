import type { SubjectResponseDto } from "./SubjectDtos";
import type { UserResponseDto } from "./UserDtos";
import type { WeekResponseDto } from "./WeekDtos";
import type { AttachmentResponseDto } from "./AttachmentDtos";
import type { SearchDto } from "./BaseDtos";

export type MaterialCreateDto = {
    name: string;
    material_type: string;
    subject_id: number;
    parent_id?: number | null;
    week_id?: number | null;
    details?: object | null;
};

export type MaterialResponseDto = {
    id?: number | null;
    name?: string | null;
    material_type?: string | null;
    details?: object | null;
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
    subject?: SubjectResponseDto | null;
    parent_id?: number | null;
    children?: MaterialResponseDto[] | null;
    attachment?: AttachmentResponseDto | null;
    week?: WeekResponseDto | null;
};

export type MaterialUpdateDto = {
    name: string;
    material_type: string;
    week_id?: number | null;
    details?: object | null;
};

export type MaterialsDeleteDto = {
    material_ids: number[];
};

export type MaterialSearchDto = {
    id?: number | null;
    material_type?: string | null;
    subject_id?: number | null;
    parent_id?: number | null;
    week_id?: number | null;
    author_id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;

export type MaterialsCopyOrMoveDto = {
    material_ids: number[];
    subject_id: number;
    destination_id?: number | null;
};

export type MaterialsFetchFromDriveDto = {
    url: string;
    subject_id?: number | null;
    parent_id?: number | null;
};

export type MaterialDownloadManyDto = {
    material_ids: number[];
};