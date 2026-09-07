import type { EventLocationType } from "../entities/Event";
import type { LinkData } from "../entities/Task";
import type { UserResponseDto } from "./UserDtos";
import type { FacultyResponseDto } from "./FacultyDtos";
import type { DepartmentResponseDto } from "./DepartmentDtos";
import type { YearResponseDto } from "./YearDtos";
import type { AttachmentResponseDto } from "./AttachmentDtos";
import type { SearchDto } from "./BaseDtos";

export type EventCreateDto = {
    title: string;
    start_date: string;
    end_date?: string | null;
    price: number;
    location_type: EventLocationType;
    location: string;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    event_organizer_id: number;
    details?: {
        description?: string;
        url?: string; // logo
        urls?: string[]; // files
        links?: LinkData[]; // links
    };
};

export type EventResponseDto = {
    id?: number | null;
    title?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    price?: number | null;
    location_type?: EventLocationType | null;
    location?: string | null;
    details?: {
        description?: string | null;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
    faculty?: FacultyResponseDto | null;
    department?: DepartmentResponseDto | null;
    year?: YearResponseDto | null;
    attendees?: UserResponseDto[] | null;
    logo?: AttachmentResponseDto | null;
    attachments?: AttachmentResponseDto[] | null;
};

export type EventUpdateDto = {
    title: string;
    start_date: string;
    end_date?: string | null;
    price: number;
    location: string;
    location_type: EventLocationType;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    event_organizer_id: number;
    details?: {
        description?: string;
        url?: string; // logo
        urls?: string[]; // files
        links?: LinkData[]; // links
    } | null;
};

export type EventDeleteDto = {
    id: number;
};

export type EventSearchDto = {
    id?: number | null;
    location_type?: EventLocationType | null;
    faculty_id?: number | null;
    department_id?: number | null;
    year_id?: number | null;
    author_id?: number | null;
    event_organizer_id?: number | null;
    start_date_from?: string | null;
    start_date_to?: string | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
