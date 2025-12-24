import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { User } from "./User";
import type { Year } from "./Year";

export type Roadmap = {
    id?: number;
    name?: string;
    urls?: string[];
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
    status?: boolean;
    description?: string | null;
    type?: number;
    rating?: number;
};
