import type { AttachmentResponseDto } from "./AttachmentDtos";
import type { EventResponseDto } from "./EventDtos";
import type { LinkData } from "../entities/Task";
import type { SearchDto } from "./BaseDtos";

export type EventOrganizerCreateDto = {
    name: string;
    details?: {
        url?: string; // logo
        urls?: string[]; // files
        links?: LinkData[]; // links
    };
};

export type EventOrganizerResponseDto = {
    id?: number | null;
    name?: string | null;
    details?: object | null;
    created_at?: string | null;
    updated_at?: string | null;
    events?: EventResponseDto[] | null;
    logo?: AttachmentResponseDto | null;
    attachments?: AttachmentResponseDto[] | null;
};

export type EventOrganizerUpdateDto = {
    name: string;
    details?: {
        url?: string; // logo
        urls?: string[]; // files
        links?: LinkData[]; // links
    };
};

export type EventOrganizerDeleteDto = {
    id: number;
};

export type EventOrganizerSearchDto = {
    id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
