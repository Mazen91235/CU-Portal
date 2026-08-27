import type { UserResponseDto } from "./UserDtos";

export type PendingUserResponseDto = {
    id?: number | null;
    url?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    user?: UserResponseDto | null;
};
