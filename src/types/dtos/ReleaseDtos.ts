import type { VersionResponseDto } from "./VersionDtos";
import type { ReleaseItemMutationDto, ReleaseItemResponseDto } from "./ReleaseItemDtos";
import type { SearchDto } from "./BaseDtos";

export type ReleaseCreateDto = {
    release_number: string;
    title: string;
    date: string;
    release_items?: ReleaseItemMutationDto[];
};

export type ReleaseResponseDto = {
    id?: number | null;
    release_number?: string | null;
    title?: string | null;
    date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    version?: VersionResponseDto | null;
    release_items?: ReleaseItemResponseDto[] | null;
};

export type ReleaseUpdateDto = {
    id: number;
    release_number: string;
    title: string;
    date: string;
    release_items?: ReleaseItemMutationDto[];
};

export type ReleaseDeleteDto = {
    id: number;
};

export type ReleaseSearchDto = {
    id?: number | null;
    version_id?: number | null;
    date_from?: string | null;
    date_to?: string | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;