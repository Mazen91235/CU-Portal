import type { SearchDto } from "./SearchDTOs";

export type AnnouncementsSearchDto = {
    subject_id?: number | null;
} & SearchDto;
