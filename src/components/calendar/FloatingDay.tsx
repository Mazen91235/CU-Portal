import { useState } from "react";
import { DayEvent } from "./DayEvent";
import { EmptySection } from "./EmptySection";
import type { CalendarDayEventDto } from "../../types/dtos/CalendarDtos";
import styles from "./FloatingDay.module.css";
import { NoteForm } from "../forms/NoteForm";
import type { NoteFormData } from "../forms/NoteForm";

export const FloatingDay = ({
    isOpen,
    onClose,
    dateStr,
    events,
    onSaveNote,
}: {
    isOpen: boolean;
    onClose: () => void;
    dateStr: string;
    events: CalendarDayEventDto[];
    onSaveNote: (
        data: NoteFormData
    ) => void;
}) => {
    const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);

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
                        <div className={styles["popup-empty"]}>
                            <EmptySection
                                icon="calendar"
                                title={`Nothing scheduled for ${formattedDate}`}
                                description="You're all clear. Enjoy your day off! 🎉"
                            />
                            <button
                                type="button"
                                className={styles["add-note-btn"]}
                                onClick={() => {
                                    setIsNoteFormOpen(true);
                                }}
                            >
                                <i className="fas fa-plus"></i> Add Note
                            </button>
                        </div>
                    ) : (
                        <>
                        <div className={styles["add-note-container"]}>
                            <button
                                type="button"
                                className={styles["add-note-btn"]}
                                onClick={() => {
                                    setIsNoteFormOpen(true);
                                }}
                            >
                                <i className="fas fa-plus"></i> Add Note
                            </button>
                        </div>

                        {events.map((event, index) => (
                            <DayEvent
                                key={`event-${index}`}
                                event_type={event.event_type}
                                title={event.title}
                                subject={event.subject}
                                due={event.due}
                                location={event.location}
                                id={event.id}
                                created_at={event.created_at}
                                date={event.date}
                                />
                        ))}
                        </>
                    )}
                </div>
            </div>

            <NoteForm
                isOpen={isNoteFormOpen}
                dateStr={formattedDate}
                created_at={new Date().toISOString().split("T")[0]} // Pass the current date as created_at
                onClose={() => setIsNoteFormOpen(false)}
                onSave={(data) => {
                    onSaveNote(data);
                    setIsNoteFormOpen(false);
                }}
            />
        </div>
    );
};
