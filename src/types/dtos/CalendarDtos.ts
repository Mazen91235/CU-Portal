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
    }
>;

export type CalendarResponseDto = {
    events: CalendarDayEventsDto;
};

export type CalendarDayEventDto = {
    event_type: "assignment" | "exam" | "announcement";
    title: string;
    subject: string;
    due: string;
    location?: string;
    id: number;
};
