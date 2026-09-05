import type { UserResponseDto } from "./UserDtos";
import type { SubjectResponseDto } from "./SubjectDtos";
import type { TaskResponseDto } from "./TaskDtos";
import type { AnnouncementResponseDto } from "./AnnouncementDtos";
import type { WeekResponseDto } from "./WeekDtos";
import type { SearchDto } from "./BaseDtos";

export type YearCreateDto = {
    year: number;
};

export type YearResponseDto = {
    id?: number | null;
    year?: number | null;
    details?: object | null;
    created_at?: string | null;
    updated_at?: string | null;
    users?: UserResponseDto[] | null;
    subjects?: SubjectResponseDto[] | null;
    tasks?: TaskResponseDto[] | null;
    announcements?: AnnouncementResponseDto[] | null;
    weeks?: WeekResponseDto[] | null;
};

export type YearUpdateDto = {
    year: number;
};

export type YearSearchDto = {
    id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
