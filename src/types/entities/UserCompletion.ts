import type { User } from "./User";
import type { WeekItem } from "./WeekItem";
import type { Task } from "./Task";

export type UserCompletion = {
    id?: number;
    created_at?: string | null;
    updated_at?: string | null;
    user_id?: number;
    user?: User | null;
    week_item_id?: number | null;
    week_item?: WeekItem | null;
    task_id?: number | null;
    task?: Task | null;
};
