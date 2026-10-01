import type { MaterialResponseDto } from "./MaterialDtos";
import type { WeekItemResponseDto } from "./WeekItemDtos";
import type { SearchDto } from "./BaseDtos";

export type WeekCreateDto = {
    week_number: number;
    start_date: string;
};

export type WeekResponseDto = {
    id?: number | null;
    week_number?: number | null;
    start_date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    materials?: MaterialResponseDto[] | null;
    week_items?: WeekItemResponseDto[] | null;
};

export type WeekUpdateDto = {
    week_number: number;
    start_date: string;
};

export type WeekSearchDto = {
    id?: number | null;
    week_number?: number | null;
    start_date_from?: string | null;
    start_date_to?: string | null;
    start_date_includes?: string | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
