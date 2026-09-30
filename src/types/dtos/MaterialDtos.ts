import type { SubjectResponseDto } from "./SubjectDtos";
import type { UserResponseDto } from "./UserDtos";
import type { WeekResponseDto } from "./WeekDtos";
import type { AttachmentResponseDto } from "./AttachmentDtos";
import type { MaterialType } from "../entities/Material";
import type { SearchDto } from "./BaseDtos";

export type MaterialCreateDto = {
    name: string;
    should_overwrite: boolean;
    material_type: MaterialType;
    subject_id: number;
    parent_id?: number | null;
    week_id?: number | null;
    details?: {
        url?: string | null;
    } | null;
};

export type MaterialResponseDto = {
    id?: number | null;
    name?: string | null;
    material_type?: MaterialType | null;
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
    should_overwrite: boolean;
    material_type: MaterialType;
    week_id?: number | null;
    details?: {
        url?: string | null;
    } | null;
};

export type MaterialsDeleteDto = {
    material_ids: number[];
};

export type MaterialSearchDto = {
    id?: number | null;
    material_type?: MaterialType | null;
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
    should_overwrite: boolean;
    subject_id: number;
    destination_id?: number | null;
};

export type MaterialsFetchFromDriveDto = {
    url: string;
    should_overwrite: boolean;
    subject_id?: number | null;
    parent_id?: number | null;
};

export type MaterialDownloadManyDto = {
    material_ids: number[];
};
