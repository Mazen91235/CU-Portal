import type { Department } from "./Department";
import type { Faculty } from "./Faculty";
import type { User } from "./User";
import type { Year } from "./Year";

export type Event = {
    id?: number;
    name?: string;
    description?: string;
    instructions?: string;
    img?: string;
    price?: number | null;
    attendees?: number | null;
    urls?: string[];
    start_time?: string | null;
    end_time?: string | null;
    location?: string;
    details?: object;
    faculty?: Faculty | null;
    faculty_id?: number | null;
    department?: Department | null;
    department_id?: number | null;
    year?: Year | null;
    author?: User | null;
    author_id?: number | null;
    created_at?: string | null;
    modified_at?: string | null;
};
