import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { User } from "./User";
import type { Year } from "./Year";

export type Subject = {
    id?: number;
    name?: string;
    code?: string;
    faculty?: Faculty | null;
    faculty_id?: number | null;
    department?: Department | null;
    department_id?: number | null;
    year?: Year | null;
    year_id?: number | null;
    details?: object;
    credits?: number;
    is_old?: boolean;
    year_rank?: number;
    term?: number;
    users?: User[] | null;
    users_count?: number;
};
