import type { Faculty } from "./Faculty";
import type { Department } from "./Department";
import type { Year } from "./Year";
import type { Material } from "./Material";

export type Week = {
    id?: number;
    week_number?: number;
    start_date?: string;
    created_at?: string | null;
    updated_at?: string | null;
    faculty_id?: number;
    faculty?: Faculty | null;
    department_id?: number;
    department?: Department | null;
    year_id?: number;
    year?: Year | null;
    materials?: Material[] | null;
};
