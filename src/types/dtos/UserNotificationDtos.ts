import type { NotificationResponseDto } from "./NotificationDtos";
import type { UserResponseDto } from "./UserDtos";
import type { SearchDto } from "./BaseDtos";

export type UserNotificationResponseDto = {
    id?: number | null;
    seen?: boolean | null;
    created_at?: string | null;
    user?: UserResponseDto | null;
    notification?: NotificationResponseDto | null;
};

export type UserNotificationSearchDto = {
    id?: number | null;
    seen?: boolean | null;
    user_id?: number | null;
    notification_id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
} & SearchDto;
