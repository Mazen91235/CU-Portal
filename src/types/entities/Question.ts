import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { Subject } from "./Subject";
import type { User } from "./User";
import type { Year } from "./Year";

export type Question = {
    id?: number;
    title?: string;
    content?: string;
    urls?: string[];
    subject?: Subject | null;
    subject_id?: number | null;
    author?: User | null;
    author_id?: number | null;
    details?: object;
    faculty?: Faculty | null;
    faculty_id?: number | null;
    department?: Department | null;
    department_id?: number | null;
    year?: Year | null;
    year_id?: number | null;
    status?: boolean;
    rating?: number;
};
