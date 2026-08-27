import type { SearchDto } from "./BaseDtos";

export type MessageCreateDto = {
    name: string;
    email: string;
    phone: string;
    content: string;
};

export type MessageResponseDto = {
    id?: number | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    content?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type MessageSearchDto = {
    id?: number | null;
    created_at_from?: string | null;
    created_at_to?: string | null;
    updated_at_from?: string | null;
    updated_at_to?: string | null;
} & SearchDto;
