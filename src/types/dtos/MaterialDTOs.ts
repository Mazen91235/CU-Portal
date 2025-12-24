import type { SearchDto } from "./SearchDTOs";

export type MaterialSearchDto = {
    name?: string | null;
    subject_id?: number | null;
    parent_id?: number | null;
    faculty_id?: number | null;
    depatement_id?: number | null;
    author_id?: number | null;
    year_id?: number | null;
} & SearchDto;

export type MaterialRegisterDto = {
    name?: string | null;
    description?: string | null;
    url?: string | null;
    subject_id?: number | null;
    parent_id?: number | null;
};

export type MaterialFetchFromDriveDto = {
    drive_url?: string | null;
    subject_id?: number | null;
    parent_id?: number | null;
};

export type MaterialCopyDto = {
    material_ids?: number[] | null;
    destination_id?: number | null;
};
