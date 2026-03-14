import type { Announcement } from "../entities/Announcement";
import type { Task } from "../entities/Task";
import type { SearchDto } from "./SearchDTOs";

export type CalenderSearchDto = {
    month: number;
    year: number;
} & SearchDto;

export type CalendarDayEventsDto = Record<
    string,
    { tasks: Task[]; exams: Task[]; announcements: Announcement[] }
>;

export type DayEventDto = {
    type: "assignment" | "exam" | "announcement";
    title: string;
    subject: string;
    due: string;
    location?: string;
    id: number;
};
