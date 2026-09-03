import type { CalendarDayEventsDto } from "../../types/dtos/CalendarDtos";
import IconComponent from "../IconComponent";
import styles from "./Day.module.css";

export const Day = ({
    day,
    dateStr,
    events,
    isSelected,
    onSelect,
    isToday,
}: {
    day: number;
    dateStr: string;
    events: CalendarDayEventsDto[string];
    isSelected: boolean;
    onSelect: (date: string) => void;
    isToday: boolean;
}) => {
    const eventTypes = {
        assignment: false,
        announcement: false,
        exam: false,
        note: false,
    };

    let countExtra = 0;

    events.tasks.forEach(() => {
        if (eventTypes.assignment) countExtra++;
        else eventTypes.assignment = true;
    });

    events.exams.forEach(() => {
        if (eventTypes.exam) countExtra++;
        else eventTypes.exam = true;
    });

    events.announcements.forEach(() => {
        if (eventTypes.announcement) {
            countExtra++;
        } else {
            eventTypes.announcement = true;
        }
    });

    (events.notes || []).forEach(() => {
        if (!eventTypes.note) eventTypes.note = true;
    });

    return (
        <button
            className={`${styles["day-btn"]} ${isSelected ? styles["selected"] : ""} ${isToday ? styles["today"] : ""}`}
            onClick={() => onSelect(dateStr)}
        >
            {eventTypes.note && (
                <div className={styles["note-icon"]}>
                    <IconComponent icon="note" />
                    <span className={styles["note-count"]}>{events.notes?.length}</span>
                </div>
                )
            }
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
