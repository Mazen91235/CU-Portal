import type { Week } from "./Week";
import type { Material } from "./Material";

export type WeekItem = {
    id?: number;
    note?: string;
    created_at?: string | null;
    updated_at?: string | null;
    week_id?: number;
    week?: Week | null;
    material_id?: number;
    material?: Material | null;
};