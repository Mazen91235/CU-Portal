import type { VersionResponseDto } from "./VersionDtos";
import type {
    ReleaseItemMutationDto,
    ReleaseItemResponseDto,
} from "./ReleaseItemDtos";
import type { SearchDto } from "./BaseDtos";

export type ReleaseCreateDto = {
    release_number: string;
    title: string;
    date: string;
    details?: {
        description?: string | null;
    } | null;
    release_items?: ReleaseItemMutationDto[];
};

export type ReleaseResponseDto = {
    id?: number | null;
    release_number?: string | null;
    title?: string | null;
    date?: string | null;
    details?: {
        description?: string | null;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
    release_version?: VersionResponseDto | null;
    release_items?: ReleaseItemResponseDto[] | null;
};

export type ReleaseUpdateDto = {
    id: number;
    release_number: string;
    title: string;
    date: string;
    details?: {
        description?: string | null;
    } | null;
    release_items?: ReleaseItemMutationDto[];
};

export type ReleaseDeleteDto = {
    id: number;
};

export type ReleaseSearchDto = {
    id?: number | null;
    release_version_id?: number | null;
    date_from?: string | null;
    date_to?: string | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
