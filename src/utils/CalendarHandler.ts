import type {
    CalendarDayEventDto,
    CalendarDayEventsDto,
} from "../types/dtos/CalendarDtos";
import type { AnnouncementResponseDto } from "../types/dtos/AnnouncementDtos";
import type { TaskResponseDto } from "../types/dtos/TaskDtos";
import type { ExamResponseDto } from "../types/dtos/ExamDtos";
import { formatDateTime } from "./Formatter";

const pad = (value: number) => String(value).padStart(2, "0");

export const getCalendarDateKey = (
    value?: string | Date | null,
): string | null => {
    if (!value) return null;

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }

    const date =
        value instanceof Date ? new Date(value.getTime()) : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const moveItemToCorrectDate = <T>(
    target: CalendarDayEventsDto,
    sourceDate: string,
    item: T,
    getDate: (item: T) => string | Date | null | undefined,
    key: "tasks" | "exams" | "announcements" | "events" | "notes",
) => {
    const actualDate = getCalendarDateKey(getDate(item)) || sourceDate;
    if (!target[actualDate]) {
        target[actualDate] = {
            tasks: [],
            exams: [],
            announcements: [],
            events: [],
            notes: [],
        };
    }
    (target[actualDate][key] as T[]).push(item);
};

export const normalizeCalendarEvents = (
    events: CalendarDayEventsDto = {},
): CalendarDayEventsDto => {
    const normalized: CalendarDayEventsDto = {};

    Object.entries(events).forEach(([sourceDate, dayEvents]) => {
        dayEvents.tasks.forEach((item) =>
            moveItemToCorrectDate(
                normalized,
                sourceDate,
                item,
                (event) => event.due,
                "tasks",
            ),
        );
        dayEvents.exams.forEach((item) =>
            moveItemToCorrectDate(
                normalized,
                sourceDate,
                item,
                (event) => event.due,
                "exams",
            ),
        );
        dayEvents.announcements.forEach((item) =>
            moveItemToCorrectDate(
                normalized,
                sourceDate,
                item,
                (event) => event.due,
                "announcements",
            ),
        );
        (dayEvents.events || []).forEach((item) =>
            moveItemToCorrectDate(
                normalized,
                sourceDate,
                item,
                (event) => event.start_date,
                "events",
            ),
        );
        (dayEvents.notes || []).forEach((item) =>
            moveItemToCorrectDate(
                normalized,
                sourceDate,
                item,
                (note) => note.date,
                "notes",
            ),
        );
    });

    Object.values(normalized).forEach((day) => {
        day.tasks.sort((a, b) => a.due.localeCompare(b.due));
        day.exams.sort((a, b) => a.due.localeCompare(b.due));
        day.announcements.sort((a, b) => a.due.localeCompare(b.due));
        day.events?.sort((a, b) =>
            String(a.start_date || "").localeCompare(
                String(b.start_date || ""),
            ),
        );
        day.notes?.sort((a, b) =>
            String(a.date || "").localeCompare(String(b.date || "")),
        );
    });

    return normalized;
};

export const convertToDayEvent = (
    event: TaskResponseDto | ExamResponseDto | AnnouncementResponseDto,
    type: "assignment" | "exam" | "announcement",
): CalendarDayEventDto => {
    if (type === "assignment" || type === "exam") {
        const formattedEvent = event as TaskResponseDto | ExamResponseDto;
        return {
            event_type: type,
            title:
                formattedEvent.name ||
                (type === "exam" ? "Unknown Exam" : "Unknown Task"),
            subject: formattedEvent.subject?.name || "Unknown Subject",
            due: formatDateTime(formattedEvent.deadline),
            location: formattedEvent.details?.location,
            id: formattedEvent.id!,
        };
    }

    const formattedAnnouncement = event as AnnouncementResponseDto;
    return {
        event_type: type,
        title: formattedAnnouncement.title || "Unknown Announcement",
        subject: formattedAnnouncement.subject?.name || "Unknown Subject",
        due: formatDateTime(formattedAnnouncement.date),
        id: formattedAnnouncement.id!,
    };
};
