import type { Faculty } from "./Faculty";
import type { Department } from "./Department";
import type { Year } from "./Year";
import type { Material } from "./Material";

export type Week = {
    id?: number;
    week_number?: number;
    start_date?: Date;
    created_at?: Date | null;
    updated_at?: Date | null;
    faculty_id?: number;
    faculty?: Faculty | null;
    department_id?: number;
    department?: Department | null;
    year_id?: number;
    year?: Year | null;
    materials?: Material[] | null;
};
