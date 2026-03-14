import type { DayEventDto } from "../types/dtos/CalenderDTOs";
import type { Announcement } from "../types/entities/Announcement";
import type { Task } from "../types/entities/Task";
import { formatDateTime } from "./Formatter";

export const convertToDayEvent = (
    event: Task | Announcement,
    type: "assignment" | "exam" | "announcement",
): DayEventDto => {
    if (type == "assignment" || type == "exam") {
        const formattedEvent = event as Task;
        return {
            type,
            title: formattedEvent.name || "Unknown Task",
            subject: formattedEvent.subject?.name || "Unknown Subject",
            due: formatDateTime(formattedEvent.deadline),
            location: formattedEvent.details?.location,
            id: formattedEvent.id!,
        };
    } else {
        const formattedAnnouncement = event as Announcement;
        return {
            type,
            title: formattedAnnouncement.title || "Unknown Announcement",
            subject: formattedAnnouncement.subject?.name || "Unknown Subject",
            due: formatDateTime(formattedAnnouncement.date),
            id: formattedAnnouncement.id!,
        };
    }
};
