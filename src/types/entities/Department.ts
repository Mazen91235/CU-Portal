import type { Faculty } from "./Faculty";

export type Department = {
    id?: number;
    name?: string;
    study_type?: string;
    code?: string;
    details?: object;
    faculty?: Faculty | null;
    faculty_id?: number | null;
};
