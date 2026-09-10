import type { ReleaseResponseDto } from "./ReleaseDtos";
import type { ReleaseItemType } from "../entities/ReleaseItem";

export type ReleaseItemMutationDto = {
    item_type: ReleaseItemType;
    content: string;
};

export type ReleaseItemResponseDto = {
    id?: number | null;
    item_type?: ReleaseItemType | null;
    content?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    release?: ReleaseResponseDto | null;
};