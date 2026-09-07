import type { UserResponseDto } from "./UserDtos";
import type { SearchDto } from "./BaseDtos";

export type NoteCreateDto = {
    title: string;
    content: string;
    date?: string | null;
};

export type NoteResponseDto = {
    id?: number | null;
    title?: string | null;
    content?: string | null;
    date?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    author?: UserResponseDto | null;
};

export type NoteUpdateDto = {
    title: string;
    content: string;
    date?: string | null;
};

export type NoteDeleteDto = {
    id: number;
};

export type NoteSearchDto = {
    id?: number | null;
    author_id?: number | null;
    date_from?: string | null;
    date_to?: string | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
