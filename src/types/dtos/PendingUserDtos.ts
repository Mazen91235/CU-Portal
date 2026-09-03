import type { UserResponseDto } from "./UserDtos";
import type { AttachmentResponseDto } from "./AttachmentDtos";

export type PendingUserResponseDto = {
    id?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
    user?: UserResponseDto | null;
    attachment?: AttachmentResponseDto | null;
};
