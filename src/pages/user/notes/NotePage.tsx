import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAppSelector } from "../../../services/redux/Hooks";
import {
    NoteForm,
    type NoteFormData,
} from "../../../components/notes/NoteForm";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { LongSection } from "../../../components/section/LongSection";
import type { CalendarDayEventDto } from "../../../types/dtos/CalendarDtos";
import type { Note } from "../../../types/entities/Note";
import { formatDate, formatDateInputValue } from "../../../utils/Formatter";
import styles from "./NotePage.module.css";

const mapNote = (note: Note, index: number): CalendarDayEventDto => ({
    event_type: "note",
    id: note.id || index + 1,
    title: note.title || "Untitled note",
    content: note.content || "",
    subject: "",
    due: "",
    created_at: note.created_at?.toString(),
    date: note.date?.toString(),
});

export const NotePage = () => {
    const { noteId } = useParams<{ noteId: string }>();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const [note, setNote] = useState<CalendarDayEventDto | null>(null);
    const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const notes = user?.notes || [];
        const foundNote = notes
            .map(mapNote)
            .find((item) => item.id.toString() === noteId);
        if (foundNote) setNote(foundNote);
    }, [noteId, user]);

    if (!note) return null;

    // to be saved using API
    const handleSaveNote = (data: NoteFormData) => {
        setNote((currentNote) =>
            currentNote
                ? {
                      ...currentNote,
                      title: data.title,
                      content: data.content,
                      created_at: data.created_at,
                      date: data.date,
                  }
                : currentNote,
        );
        setIsNoteFormOpen(false);
    };

    // to be implemented: delete note functionality using API
    const handleDeleteNote = () => {
        setIsDeleteModalOpen(false);
        navigate("/user/notes");
    };

    return (
        <Layout>
            <PageSeo
                title={`${note.title} - Notes - CU Portal`}
                description={`View note details for ${note.title}`}
            />
            <SubBanner
                title={note.title}
                icon="note"
                linkText="Back to Notes"
                linkTo="/user/notes"
            />
            <div className={styles.container}>
                <div className={styles.statsRow}>
                    <StatCard
                        type="Created At"
                        value={formatDate(note.created_at)}
                        icon="calendar"
                    />
                    <StatCard
                        type="Note Date"
                        value={formatDate(note.date)}
                        icon="calendar"
                    />
                </div>

                <LongSection title="Note Content" icon="align-left">
                    <div className={styles.content}>{note.content}</div>
                </LongSection>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => setIsNoteFormOpen(true)}
                    >
                        Edit Note
                    </button>
                    <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => setIsDeleteModalOpen(true)}
                    >
                        Delete Note
                    </button>
                </div>
            </div>

            <NoteForm
                isOpen={isNoteFormOpen}
                dateStr={formatDateInputValue(note.date)}
                created_at={formatDateInputValue(note.created_at)}
                note={note}
                onClose={() => setIsNoteFormOpen(false)}
                onSave={handleSaveNote}
            />
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteNote}
                confirmText="Delete"
                title="Delete Note?"
                message={`Are you sure you want to delete "${note.title}"?`}
                colorType="red"
            />
        </Layout>
    );
};
