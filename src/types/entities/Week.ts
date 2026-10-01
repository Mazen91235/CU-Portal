import type { Material } from "./Material";
import type { WeekItem } from "./WeekItem";

export type Week = {
    id?: number;
    week_number?: number;
    start_date?: string;
    created_at?: string | null;
    updated_at?: string | null;
    materials?: Material[] | null;
    week_items?: WeekItem[] | null;
};
