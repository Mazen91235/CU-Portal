import type { SearchDto } from "./SearchDTOs";

export type EventOrganizerSearchDto = {
    name?: string;
    Logo?: string;
    AttachedLinks?: string[];
} & SearchDto;
