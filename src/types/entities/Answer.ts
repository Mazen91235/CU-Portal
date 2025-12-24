import type { Question } from "./Question";
import type { User } from "./User";

export type Answer = {
    id?: number;
    content?: string;
    urls?: string[];
    question?: Question | null;
    questionId?: number | null;
    author?: User | null;
    authorId?: number | null;
    details?: object;
};
