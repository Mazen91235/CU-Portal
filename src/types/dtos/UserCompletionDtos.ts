import type { TaskResponseDto } from "./TaskDtos";
import type { WeekItemResponseDto } from "./WeekItemDtos";
import type { SearchDto } from "./BaseDtos";

export type UserCompletionCreateDto = {
    week_item_id?: number | null;
    task_id?: number | null;
};

export type UserCompletionResponseDto = {
    id?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    user_id?: number | null;
    week_item_id?: number | null;
    task_id?: number | null;
    week_item?: WeekItemResponseDto | null;
    task?: TaskResponseDto | null;
};

export type UserCompletionSearchDto = {
    id?: number | null;
    user_id?: number | null;
    week_item_id?: number | null;
    task_id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
