import type { Week } from "./Week";
import type { Material } from "./Material";
import type { User } from "./User";
import type { UserCompletion } from "./UserCompletion";

export type WeekItem = {
    id?: number;
    note?: string;
    created_at?: string | null;
    updated_at?: string | null;
    week_id?: number;
    week?: Week | null;
    material_id?: number;
    material?: Material | null;
    completed_by_users?: User[] | null;
    user_completions?: UserCompletion[] | null;
};
