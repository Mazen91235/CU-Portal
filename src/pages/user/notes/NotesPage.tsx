import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../services/redux/Hooks";
import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { DateFilter } from "../../../components/forms/DateFilter";
import { NoteForm, type NoteFormData } from "../../../components/forms/NoteForm";
import { Search } from "../../../components/forms/Search";
import { Layout } from "../../../components/layout/Layout";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { PageSeo } from "../../../components/PageSeo";
import type { CalendarDayEventDto } from "../../../types/dtos/CalendarDtos";
import { formatDate, formatDateInputValue, formatDateTime } from "../../../utils/Formatter";
import styles from "./NotesPage.module.css";

export const NotesPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState(
        new Date().toLocaleDateString("en-CA"),
    );
    const [dateTo, setDateTo] = useState("");
    const [notes, setNotes] = useState<CalendarDayEventDto[]>(() =>
        (user?.notes || []).map((note, index) => ({
            event_type: "note" as const,
            id: note.id || index + 1,
            title: note.title || "Untitled note",
            content: note.content || "",
            subject: "",
            due: "",
            created_at: note.created_at?.toString(),
            date: note.date?.toString(),
        })),
    );
    const [editingNote, setEditingNote] = useState<CalendarDayEventDto>();
    const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<CalendarDayEventDto>();

    useEffect(() => {
        if (notes.length === 0 && user?.notes?.length) {
            setNotes(
                user.notes.map((note, index) => ({
                    event_type: "note" as const,
                    id: note.id || index + 1,
                    title: note.title || "Untitled note",
                    content: note.content || "",
                    subject: "",
                    due: "",
                    created_at: note.created_at?.toString(),
                    date: note.date?.toString(),
                })),
            );
        }
    }, [notes.length, user]);

    const filteredNotes = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return notes.filter((note) => {
            const matchesSearch =
                !query ||
                note.title.toLowerCase().includes(query) ||
                note.content?.toLowerCase().includes(query);
            const noteDate = formatDateInputValue(note.created_at);
            const matchesFrom = !dateFrom || noteDate == dateFrom;
            const matchesTo = !dateTo || noteDate <= dateTo;
            return matchesSearch && matchesFrom && matchesTo;
        });
    }, [dateFrom, dateTo, notes, searchQuery]);


    // to be saved using API
    const handleSaveNote = (data: NoteFormData) => {
        setNotes((currentNotes) => {
            if (!editingNote) {
                return [
                    ...currentNotes,
                    {
                        event_type: "note" as const,
                        id: Date.now(),
                        title: data.title,
                        content: data.content,
                        subject: "",
                        due: "",
                        created_at: data.created_at,
                        date: data.date,
                    },
                ];
            }

            return currentNotes.map((note) =>
                note.id === editingNote.id
                    ? {
                          ...note,
                          title: data.title,
                          content: data.content,
                          created_at: data.created_at,
                          date: data.date,
                      }
                    : note,
            );
        });
        setEditingNote(undefined);
        setIsNoteFormOpen(false);
    };

    // to be deleted using API
    const handleDeleteNote = () => {
        if (!noteToDelete) return;
        setNotes((currentNotes) =>
            currentNotes.filter((note) => note.id !== noteToDelete.id),
        );
        setNoteToDelete(undefined);
    };

    return (
        <Layout>
            <PageSeo
                title="Notes - CU Portal"
                description="View and manage your personal notes"
            />
            <Banner
                title="My Notes"
                description="Keep your personal notes organized"
                button="Create Note"
                buttonAction={() => {
                    setEditingNote(undefined);
                    setIsNoteFormOpen(true);
                }}
            />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search notes..."
                            setValue={setSearchQuery}
                        />
                    </div>
                    <div className={styles.filtersRow}>
                        <DateFilter
                            placeholder="Date From"
                            setValue={setDateFrom}
                            defaultDate={dateFrom}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateTo}
                        />
                    </div>
                </div>

                <div className={styles.notesGrid}>
                    {filteredNotes.map((note) => (
                        <Card
                            key={note.id}
                            title={note.title}
                            badge="Note"
                            items={[
                                {
                                    icon: "calendar",
                                    label: "Created At",
                                    value: formatDate(note.created_at),
                                },
                                {
                                    icon: "calendar",
                                    label: "Date",
                                    value: formatDateTime(note.date, false, false),
                                },
                            ]}
                            hasOptions
                            button="View Note"
                            buttonAction={() => navigate(`/user/notes/${note.id}`)}
                            editable
                            deletable
                            onEdit={() => {
                                setEditingNote(note);
                                setIsNoteFormOpen(true);
                            }}
                            onDelete={() => setNoteToDelete(note)}
                        />
                    ))}
                </div>

                {filteredNotes.length === 0 && (
                    <NoContentSection icon="note-sticky" label="No notes found" />
                )}
            </div>

            <NoteForm
                isOpen={isNoteFormOpen}
                dateStr={editingNote?.date|| ""}
                note={editingNote}
                created_at={editingNote?.created_at}
                onClose={() => {
                    setIsNoteFormOpen(false);
                    setEditingNote(undefined);
                }}
                onSave={handleSaveNote}
            />
            <ConfirmModal
                isOpen={!!noteToDelete}
                onClose={() => setNoteToDelete(undefined)}
                onConfirm={handleDeleteNote}
                confirmText="Delete"
                title="Delete Note?"
                message={`Are you sure you want to delete "${noteToDelete?.title}"?`}
                colorType="red"
            />
        </Layout>
    );
};