import type { ReleaseResponseDto } from "./ReleaseDtos";
import type { SearchDto } from "./BaseDtos";

export type VersionResponseDto = {
    id?: number | null;
    version_number?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    releases?: ReleaseResponseDto[] | null;
};

export type VersionSearchDto = {
    id?: number | null;
    version_number?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
