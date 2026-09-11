import type { NoteResponseDto } from "./NoteDtos";
import type { EventResponseDto } from "./EventDtos";

export type CalendarSearchDto = {
    date_from: string;
    date_to: string;
};

export type CalendarDayEventsDto = Record<
    string,
    {
        tasks: CalendarDayEventDto[];
        exams: CalendarDayEventDto[];
        announcements: CalendarDayEventDto[];
        events?: EventResponseDto[];
        notes?: NoteResponseDto[];
    }
>;

export type CalendarResponseDto = {
    events: CalendarDayEventsDto;
};

export type CalendarDayEventDto = {
    event_type: "assignment" | "exam" | "announcement" | "note";
    title: string;
    subject: string;
    due: string;
    location?: string;
    id: number;
    content?: string;
    created_at?: string;
    date?: string;
};
