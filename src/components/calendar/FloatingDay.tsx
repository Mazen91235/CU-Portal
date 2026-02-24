import { DayEvent } from "./DayEvent";
import { EmptySection } from "./EmptySection";

import styles from "./FloatingDay.module.css";

export const FloatingDay = ({
    isOpen,
    onClose,
    dateStr,
    events,
}: {
    isOpen: boolean;
    onClose: () => void;
    dateStr: string;
    events: {
        type: "exam" | "assignment" | "event";
        title: string;
        due?: string;
        location?: string;
        subject?: string;
        id: number;
    }[];
}) => {
    if (!isOpen) return null;

    const dateObj = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const formattedDate = dateObj.toLocaleDateString(undefined, options);

    return (
        <div className={styles["overlay"]} onClick={onClose}>
            <div
                className={styles["popup"]}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles["popup-header"]}>
                    <h2 className={styles["popup-title"]}>
                        <i className="far fa-calendar"></i>
                        <span>{formattedDate}</span>
                    </h2>
                    <button className={styles["close-btn"]} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className={styles["popup-content"]}>
                    {events.length === 0 ? (
                        <EmptySection
                            icon="calendar"
                            title={`Nothing scheduled for ${formattedDate}`}
                            description="You're all clear. Enjoy your day off! 🎉"
                        />
                    ) : (
                        events.map((event, index) => (
                            <DayEvent
                                key={`event-${index}`}
                                type={event.type}
                                title={event.title}
                                subject={event.subject}
                                due={event.due}
                                location={event.location}
                                id={event.id}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
