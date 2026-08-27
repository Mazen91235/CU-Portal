import type { FileData, LinkData } from "./Task";
import type { Event } from "./Event";
import type { Attachment } from "./Attachment";

export type EventOrganizer = {
    id?: number;
    name?: string;
    url?: string;
    urls?: string[] | null;
    links?: LinkData[] | null;
    details?: {
        files_data?: FileData[];
    };
    created_at?: Date | null;
    updated_at?: Date | null;
    events?: Event[] | null;
    logo_id?: number | null;
    logo?: Attachment | null;
    attachments?: Attachment[] | null;
};
