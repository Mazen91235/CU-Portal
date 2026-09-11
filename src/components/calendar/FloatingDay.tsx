import { useState } from "react";
import { DayEvent } from "./DayEvent";
import { CalendarNoteCard } from "./CalendarNoteCard";
import { CalendarEventCard } from "./CalendarEventCard";
import { EmptySection } from "./EmptySection";
import type { CalendarDayEventsDto } from "../../types/dtos/CalendarDtos";
import styles from "./FloatingDay.module.css";
import { NoteForm, type NoteFormData } from "../notes/NoteForm";
import { NotePopup } from "../notes/NotePopup";
import type { NoteResponseDto, NoteUpdateDto } from "../../types/dtos/NoteDtos";
import { parseDateString } from "../../utils/Formatter";
import ConfirmModal from "../modal/ConfirmModal";

export const FloatingDay = ({
    isOpen,
    onClose,
    dateStr,
    events,
    onSaveNote,
    onUpdateNote,
    onDeleteNote,
    busy = false,
}: {
    isOpen: boolean;
    onClose: () => void;
    dateStr: string;
    events: CalendarDayEventsDto[string];
    onSaveNote: (data: NoteFormData) => Promise<void> | void;
    onUpdateNote?: (note: NoteResponseDto, data: NoteUpdateDto) => Promise<void> | void;
    onDeleteNote?: (note: NoteResponseDto) => Promise<void> | void;
    busy?: boolean;
}) => {
    const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<NoteResponseDto | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<NoteResponseDto | null>(null);
    const [viewedNote, setViewedNote] = useState<NoteResponseDto | null>(null);

    if (!isOpen) return null;

    const dateObj = parseDateString(dateStr) || new Date(dateStr);
    const formattedDate = dateObj.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const hasContent = Boolean(
        events.notes?.length ||
            events.events?.length ||
            events.announcements.length ||
            events.exams.length ||
            events.tasks.length,
    );

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
                <div className={styles["popup-header"]}>
                    <h2 className={styles["popup-title"]}>
                        <i className="far fa-calendar" />
                        <span>{formattedDate}</span>
                    </h2>
                    <button type="button" className={styles["close-btn"]} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className={styles["popup-content"]}>
                    <div className={styles["add-note-container"]}>
                        <button type="button" className={styles["add-note-btn"]} onClick={() => setIsNoteFormOpen(true)}>
                            <i className="fas fa-plus" /> Add Note
                        </button>
                    </div>

                    {!hasContent ? (
                        <EmptySection
                            icon="calendar"
                            title={`Nothing scheduled for ${formattedDate}`}
                            description="You're all clear. Enjoy your day off! 🎉"
                        />
                    ) : (
                        <div className={styles.sections}>
                            {!!events.notes?.length && (
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Notes</h3>
                                    <div className={styles.sectionCards}>
                                        {events.notes.map((note) => (
                                            <CalendarNoteCard
                                                key={note.id}
                                                note={note}
                                                onView={() => setViewedNote(note)}
                                    viewButtonPlacement="inline"
                                                onEdit={onUpdateNote ? () => { setEditingNote(note); setIsNoteFormOpen(true); } : undefined}
                                                onDelete={onDeleteNote ? () => setNoteToDelete(note) : undefined}
                                                disabled={busy}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {!!events.events?.length && (
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Events</h3>
                                    <div className={styles.sectionCards}>
                                        {events.events.map((event) => (
                                            <CalendarEventCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {!!events.announcements.length && (
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Announcements</h3>
                                    <div className={styles.sectionCards}>
                                        {events.announcements.map((event) => (
                                            <DayEvent key={`${event.id}-${event.due}`} {...event} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {!!events.exams.length && (
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Exams</h3>
                                    <div className={styles.sectionCards}>
                                        {events.exams.map((event) => (
                                            <DayEvent key={`${event.id}-${event.due}`} {...event} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {!!events.tasks.length && (
                                <section className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Assignments</h3>
                                    <div className={styles.sectionCards}>
                                        {events.tasks.map((event) => (
                                            <DayEvent key={`${event.id}-${event.due}`} {...event} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <NoteForm
                isOpen={isNoteFormOpen}
                dateStr={dateStr}
                note={editingNote}
                onClose={() => {
                    if (!busy) {
                        setIsNoteFormOpen(false);
                        setEditingNote(null);
                    }
                }}
                onSave={async (data) => {
                    if (editingNote && onUpdateNote) {
                        await onUpdateNote(editingNote, data);
                    } else {
                        await onSaveNote(data);
                    }
                    setIsNoteFormOpen(false);
                    setEditingNote(null);
                }}
            />

            <NotePopup
                isOpen={!!viewedNote}
                note={viewedNote}
                onClose={() => setViewedNote(null)}
            />

            <ConfirmModal
                isOpen={!!noteToDelete}
                onClose={() => { if (!busy) setNoteToDelete(null); }}
                onConfirm={async () => {
                    if (!noteToDelete || !onDeleteNote) return;
                    await onDeleteNote(noteToDelete);
                    setNoteToDelete(null);
                }}
                confirmText="Delete"
                title="Delete Note?"
                message={`Are you sure you want to delete "${noteToDelete?.title || "this note"}"?`}
                colorType="red"
                disabled={busy}
            />
        </div>
    );
};
