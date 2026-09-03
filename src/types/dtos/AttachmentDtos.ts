// attachmentDtos.ts
import type { UserResponseDto } from "./UserDtos";
import type { PendingUserResponseDto } from "./PendingUserDtos";
import type { MaterialResponseDto } from "./MaterialDtos";
import type { TaskResponseDto } from "./TaskDtos";
import type { AnnouncementResponseDto } from "./AnnouncementDtos";
import type { FileData } from "../entities/Attachment";

export type AttachmentResponseDto = {
    id?: number | null;
    is_file?: boolean | null;
    url?: string | null;
    details?: {
        file_data?: FileData;
        fetched?: boolean;
        link_title?: string;
    };
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
    user?: UserResponseDto | null;
    pending_user?: PendingUserResponseDto | null;
    material?: MaterialResponseDto | null;
    task?: TaskResponseDto | null;
    announcement?: AnnouncementResponseDto | null;
};
