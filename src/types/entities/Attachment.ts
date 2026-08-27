import type { FileData } from "./Task";
import type { User } from "./User";
import type { PendingUser } from "./PendingUser";
import type { Material } from "./Material";
import type { Task } from "./Task";
import type { Announcement } from "./Announcement";
import type { Event } from "./Event";
import type { EventOrganizer } from "./EventOrganizer";

export type Attachment = {
    id?: number;
    is_file?: boolean;
    url?: string;
    details?: {
        file_data?: FileData;
    };
    author_google_refresh_token?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    author_id?: number;
    author?: User | null;
    pending_user_id?: number | null;
    pending_user?: PendingUser | null;
    material_id?: number | null;
    material?: Material | null;
    task_id?: number | null;
    task?: Task | null;
    announcement_id?: number | null;
    announcement?: Announcement | null;
    event_logo?: Event | null;
    event_id?: number | null;
    event?: Event | null;
    event_organizer_logo?: EventOrganizer | null;
    event_organizer_id?: number | null;
    event_organizer?: EventOrganizer | null;
};
