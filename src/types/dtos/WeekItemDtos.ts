import type { MaterialResponseDto } from "./MaterialDtos";
import type { WeekResponseDto } from "./WeekDtos";
import type { UserResponseDto } from "./UserDtos";
import type { UserCompletionResponseDto } from "./UserCompletionDtos";

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
    completed_by_users?: UserResponseDto[] | null;
    user_completions?: UserCompletionResponseDto[] | null;
};
