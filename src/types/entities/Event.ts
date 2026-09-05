import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { User } from "./User";
import type { Year } from "./Year";
import type { EventOrganizer } from "./EventOrganizer";
import type { UserEvent } from "./UserEvent";
import type { Attachment } from "./Attachment";

export type Event = {
    id?: number;
    title?: string;
    start_date?: Date;
    end_date?: Date | null;
    price?: number;
    location_type?: Date;
    location?: Date;
    details?: {
        description?: string;
    };
    created_at?: Date | null;
    updated_at?: Date | null;
    author_id?: number | null;
    author?: User | null;
    faculty_id?: number | null;
    faculty?: Faculty | null;
    department_id?: number | null;
    department?: Department | null;
    year_id?: number | null;
    year?: Year | null;
    event_organizer_id?: number | null;
    event_organizer?: EventOrganizer | null;
    attendees?: User[] | null;
    user_events?: UserEvent[] | null;
    logo_id?: number | null;
    logo?: Attachment | null;
    attachments?: Attachment[] | null;
};
