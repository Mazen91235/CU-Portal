import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { User } from "./User";
import type { Year } from "./Year";

export type TimeTable = {
    id?: number;
    name?: string;
    type?: number;
    days?: number;
    time_specific?: boolean;
    details?: object;
    created_at?: string | null;
    modified_at?: string | null;
    author?: User | null;
    author_id?: number | null;
    faculty?: Faculty | null;
    faculty_id?: number | null;
    department?: Department | null;
    department_id?: number | null;
    year?: Year | null;
    year_id?: number | null;
    public?: boolean;
    approved?: boolean;
    requested_table?: TimeTable | null;
    requested_table_id?: number | null;
    forks?: number;
    rating?: number;
};
