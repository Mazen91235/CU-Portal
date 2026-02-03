import type { Task } from "../entities/Task";
import type { SearchDto } from "./SearchDTOs";

export type CalenderSearchDto = {
    month: number;
    year: number;
} & SearchDto;

export type CalendarDayEventsDto = Record<
    string,
    { tasks: Task[]; exams: Task[] }
>;
