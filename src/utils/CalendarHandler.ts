import type { CalendarDayEventDto } from "../types/dtos/CalendarDtos";
import type { AnnouncementResponseDto } from "../types/dtos/AnnouncementDtos";
import type { TaskResponseDto } from "../types/dtos/TaskDtos";
import type { ExamResponseDto } from "../types/dtos/ExamDtos";
import { formatDateTime } from "./Formatter";

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
            due: formatDateTime(formattedEvent.deadline?.toLocaleString()),
            location: formattedEvent.details?.location,
            id: formattedEvent.id!,
        };
    }

    const formattedAnnouncement = event as AnnouncementResponseDto;
    return {
        event_type: type,
        title: formattedAnnouncement.title || "Unknown Announcement",
        subject: formattedAnnouncement.subject?.name || "Unknown Subject",
        due: formatDateTime(formattedAnnouncement.date?.toISOString()),
        id: formattedAnnouncement.id!,
    };
};
