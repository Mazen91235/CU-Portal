import type { Task } from "../../types/entities/Task";
import type { Announcement } from "../../types/entities/Announcement";
import styles from "./Day.module.css";

export const Day = ({
    day,
    dateStr,
    events,
    isSelected,
    onSelect,
}: {
    day: number;
    dateStr: string;
    events: { tasks: Task[]; exams: Task[]; announcements: Announcement[] };
    isSelected: boolean;
    onSelect: (date: string) => void;
}) => {
    const eventTypes = {
        assignment: false,
        announcement: false,
        exam: false,
    };

    let countExtra = 0;

    [...events.tasks, ...events.exams].forEach((ev) => {
        const type = ev.type == "task" ? "assignment" : ev.type;
        if (eventTypes[type as keyof typeof eventTypes]) {
            countExtra++;
        } else {
            eventTypes[type as keyof typeof eventTypes] = true;
        }
    });

    events.announcements.forEach(() => {
        if (eventTypes.announcement) {
            countExtra++;
        } else {
            eventTypes.announcement = true;
        }
    });

    return (
        <button
            className={`${styles["day-btn"]} ${isSelected ? styles["selected"] : ""}`}
            onClick={() => onSelect(dateStr)}
        >
            <span className={styles["day-number"]}>{day}</span>
            <div className={styles["day-dots"]}>
                {eventTypes.assignment && (
                    <span
                        className={`${styles["event-dot"]} ${styles["dot-assignment"]}`}
                    ></span>
                )}
                {eventTypes.announcement && (
                    <span
                        className={`${styles["event-dot"]} ${styles["dot-announcement"]}`}
                    ></span>
                )}
                {eventTypes.exam && (
                    <span
                        className={`${styles["event-dot"]} ${styles["dot-exam"]}`}
                    ></span>
                )}
                {countExtra > 0 && (
                    <span
                        className={`${styles["event-dot"]} ${styles["dot-more"]}`}
                    >
                        +{countExtra}
                    </span>
                )}
            </div>
        </button>
    );
};
