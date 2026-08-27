export type CalendarSearchDto = {
    date_from: string;
    date_to: string;
};

export type CalendarResponseDto = Record<
    string,
    { tasks: DayEventDto[]; exams: DayEventDto[]; announcements: DayEventDto[] }
>;

export type DayEventDto = {
    type: "assignment" | "exam" | "announcement";
    title: string;
    subject: string;
    due: string;
    location?: string;
    id: number;
};
