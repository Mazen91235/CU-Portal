import type { MaterialResponseDto } from "./MaterialDtos";
import type { WeekResponseDto } from "./WeekDtos";

export type WeekItemMutationDto = {
    week_id: number;
    note?: string;
};

export type WeekItemResponseDto = {
    id?: number | null;
    note?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    week?: WeekResponseDto | null;
    material?: MaterialResponseDto | null;
};