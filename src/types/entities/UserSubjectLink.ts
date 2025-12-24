import type { Subject } from "./Subject";
import type { User } from "./User";

export type UserSubjectLink = {
    id?: number;
    user?: User | null;
    user_id?: number | null;
    subject?: Subject | null;
    subject_id?: number | null;
};
