import type { User } from "./User";
import type { Subject } from "./Subject";

export type UserSubjectLink = {
    id?: number;
    created_at?: Date | null;
    updated_at?: Date | null;
    user_id?: number;
    user?: User | null;
    subject_id?: number;
    subject?: Subject | null;
};
