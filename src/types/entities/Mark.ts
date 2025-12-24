import type { Subject } from "./Subject";
import type { User } from "./User";

export type Mark = {
    id?: number;
    name?: string;
    url?: string;
    subject?: Subject | null;
    author?: User | null;
    author_id?: number | null;
    details?: object;
};
