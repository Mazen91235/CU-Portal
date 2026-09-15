import { useState, useCallback, useEffect } from "react";
import { useLazyGetCalendarTasksQuery } from "../../../services/apis/user/CalendarAPIs";
import {
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
} from "../../../services/apis/user/NoteAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { normalizeCalendarEvents } from "../../../utils/CalendarHandler";
import { parseDateString } from "../../../utils/Formatter";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Layout } from "../../../components/layout/Layout";
import { Calendar } from "../../../components/calendar/Calendar";
import { DayEvent } from "../../../components/calendar/DayEvent";
import { EmptySection } from "../../../components/calendar/EmptySection";
import {
    NoteForm,
    type NoteFormData,
} from "../../../components/notes/NoteForm";
import { CalendarNoteCard } from "../../../components/calendar/CalendarNoteCard";
import { CalendarEventCard } from "../../../components/calendar/CalendarEventCard";
import { NotePopup } from "../../../components/notes/NotePopup";
import { showToast } from "../../../utils/ToastsManager";
import type { NoteResponseDto } from "../../../types/dtos/NoteDtos";
import type { CalendarDayEventsDto } from "../../../types/dtos/CalendarDtos";

import styles from "./CalendarPage.module.css";

export const CalendarPage = () => {
    const [eventsData, setEventsData] = useState<CalendarDayEventsDto>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
    const [getCalendar] = useLazyGetCalendarTasksQuery();
    const [createNote, { isLoading: isCreatingNote }] = useCreateNoteMutation();
    const [updateNote, { isLoading: isUpdatingNote }] = useUpdateNoteMutation();
    const [deleteNote, { isLoading: isDeletingNote }] = useDeleteNoteMutation();
    const [viewedNote, setViewedNote] = useState<NoteResponseDto | null>(null);
    const [editingNote, setEditingNote] = useState<NoteResponseDto | null>(
        null,
    );
    const [noteToDelete, setNoteToDelete] = useState<NoteResponseDto | null>(
        null,
    );

    const fetchCalendar = useCallback(
        async (year: number, month: number) => {
            try {
                const result = await getCalendar({
                    date_from: `${year}-${String(month + 1).padStart(2, "0")}-01`,
                    date_to: `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`,
                }).unwrap();

                setEventsData(
                    normalizeCalendarEvents(result.data?.events || {}),
                );
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [getCalendar],
    );

    const authQueryParams = useCallback(
        () => fetchCalendar(currentYear, currentMonth),
        [fetchCalendar, currentYear, currentMonth],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        const today = new Date();
        if (
            today.getFullYear() === currentYear &&
            today.getMonth() === currentMonth
        ) {
            const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
            setSelectedDate(todayStr);
        } else {
            setSelectedDate(null);
        }
    }, [currentYear, currentMonth]);

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
    };

    const handleMonthChange = async (year: number, month: number) => {
        setCurrentYear(year);
        setCurrentMonth(month);
    };

    const handleSaveNote = async (data: NoteFormData) => {
        try {
            if (editingNote?.id) {
                await updateNote({ note_id: editingNote.id, ...data }).unwrap();
                showToast("success", "Success", "Note updated successfully.");
            } else {
                await createNote({
                    ...data,
                    date: data.date || selectedDate || undefined,
                }).unwrap();
                showToast("success", "Success", "Note created successfully.");
            }
            setEditingNote(null);
            setIsNoteFormOpen(false);
            await fetchCalendar(currentYear, currentMonth);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleDeleteNote = async () => {
        if (!noteToDelete?.id) return;
        try {
            await deleteNote({ note_id: noteToDelete.id }).unwrap();
            setNoteToDelete(null);
            await fetchCalendar(currentYear, currentMonth);
            showToast("success", "Success", "Note deleted successfully.");
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const notesBusy = isCreatingNote || isUpdatingNote || isDeletingNote;

    const selectedEvents: CalendarDayEventsDto[string] = {
        ...(selectedDate
            ? eventsData[selectedDate] || {
                  tasks: [],
                  exams: [],
                  announcements: [],
              }
            : {
                  tasks: [],
                  exams: [],
                  announcements: [],
                  events: [],
                  notes: [],
              }),
    };

    const renderDetailsSection = () => {
        if (!selectedDate) {
            return (
                <EmptySection
                    icon="calendar"
                    title="Select a day to see what's happening 🚀"
                    description="Click on any date to view your announcements, assignments, and exams"
                />
            );
        }

        const dateObj = parseDateString(selectedDate) || new Date(selectedDate);
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        const dateStr = dateObj.toLocaleDateString(undefined, options);

        return (
            <div className={styles["details-section"]}>
                <div className={styles["details-header"]}>
                    <i className="far fa-calendar"></i>
                    <span>{dateStr}</span>
                    <button
                        type="button"
                        className={styles["add-note-btn"]}
                        onClick={() => {
                            setEditingNote(null);
                            setIsNoteFormOpen(true);
                        }}
                    >
                        <i className="fas fa-plus"></i> Add Note
                    </button>
                </div>
                <div className={styles["events-list"]}>
                    {selectedEvents.notes?.length ? (
                        <section className={styles["day-section"]}>
                            <h4 className={styles["day-section-title"]}>
                                Notes
                            </h4>
                            <div className={styles["day-section-cards"]}>
                                {selectedEvents.notes.map((note) => (
                                    <CalendarNoteCard
                                        key={note.id}
                                        note={note}
                                        onView={() => setViewedNote(note)}
                                        viewButtonPlacement="inline"
                                        onEdit={() => {
                                            setEditingNote(note);
                                            setIsNoteFormOpen(true);
                                        }}
                                        onDelete={() => setNoteToDelete(note)}
                                        disabled={notesBusy}
                                    />
                                ))}
                            </div>
                        </section>
                    ) : null}
                    {selectedEvents.events?.length ? (
                        <section className={styles["day-section"]}>
                            <h4 className={styles["day-section-title"]}>
                                Events
                            </h4>
                            <div className={styles["day-section-cards"]}>
                                {selectedEvents.events.map((event) => (
                                    <CalendarEventCard
                                        key={event.id}
                                        event={event}
                                    />
                                ))}
                            </div>
                        </section>
                    ) : null}
                    {selectedEvents.announcements.length ? (
                        <section className={styles["day-section"]}>
                            <h4 className={styles["day-section-title"]}>
                                Announcements
                            </h4>
                            {selectedEvents.announcements.map((event) => (
                                <DayEvent
                                    key={`${event.id}-${event.due}`}
                                    {...event}
                                />
                            ))}
                        </section>
                    ) : null}
                    {selectedEvents.exams.length ? (
                        <section className={styles["day-section"]}>
                            <h4 className={styles["day-section-title"]}>
                                Exams
                            </h4>
                            {selectedEvents.exams.map((event) => (
                                <DayEvent
                                    key={`${event.id}-${event.due}`}
                                    {...event}
                                />
                            ))}
                        </section>
                    ) : null}
                    {selectedEvents.tasks.length ? (
                        <section className={styles["day-section"]}>
                            <h4 className={styles["day-section-title"]}>
                                Assignments
                            </h4>
                            {selectedEvents.tasks.map((event) => (
                                <DayEvent
                                    key={`${event.id}-${event.due}`}
                                    {...event}
                                />
                            ))}
                        </section>
                    ) : null}
                    {!selectedEvents.notes?.length &&
                        !selectedEvents.events?.length &&
                        !selectedEvents.announcements.length &&
                        !selectedEvents.exams.length &&
                        !selectedEvents.tasks.length && (
                            <EmptySection
                                icon="calendar"
                                title={`Nothing scheduled for ${dateStr}`}
                                description="You're all clear. Enjoy your day off! 🎉"
                            />
                        )}
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <PageSeo
                title="Calendar - CU Portal"
                description="Keep track of your academic schedule with the CU Portal calendar"
            />

            <SubBanner
                title="Student Calendar"
                description="Keep track of your academic schedule"
            />

            <div className={styles["calendar-container"]}>
                <div className={styles["calendar-card"]}>
                    <Calendar
                        eventsData={eventsData}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        onMonthChange={handleMonthChange}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                    />
                </div>

                {renderDetailsSection()}
            </div>
            <NoteForm
                isOpen={isNoteFormOpen}
                dateStr={selectedDate || ""}
                note={editingNote}
                onClose={() => {
                    if (!notesBusy) {
                        setIsNoteFormOpen(false);
                        setEditingNote(null);
                    }
                }}
                onSave={handleSaveNote}
            />
            <NotePopup
                isOpen={!!viewedNote}
                note={viewedNote}
                onClose={() => setViewedNote(null)}
            />
            <ConfirmModal
                isOpen={!!noteToDelete}
                onClose={() => {
                    if (!notesBusy) setNoteToDelete(null);
                }}
                onConfirm={handleDeleteNote}
                confirmText="Delete"
                title="Delete Note?"
                message={`Are you sure you want to delete "${noteToDelete?.title || "this note"}"?`}
                colorType="red"
                disabled={notesBusy}
            />
        </Layout>
    );
};
