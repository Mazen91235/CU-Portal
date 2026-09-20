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
        event: false,
    };

    let countExtra = 0;

    const markType = (type: keyof typeof eventTypes) => {
        if (eventTypes[type]) countExtra++;
        else eventTypes[type] = true;
    };

    events.tasks.forEach(() => markType("assignment"));
    events.exams.forEach(() => markType("exam"));
    events.announcements.forEach(() => markType("announcement"));
    (events.events || []).forEach(() => markType("event"));
    (events.notes || []).forEach(() => {
        eventTypes.note = true;
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
                {eventTypes.note && (
                    <span
                        className={`${styles["event-dot"]} ${styles["dot-note"]} ${styles["mobile-note-dot"]}`}
                        aria-label="Notes"
                    />
                )}
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
                {eventTypes.event && (
                    <span
                        className={`${styles["event-dot"]} ${styles["dot-event"]}`}
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
