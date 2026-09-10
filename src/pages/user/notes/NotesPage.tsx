import { useCallback, useMemo, useState } from "react";
import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { DateFilter } from "../../../components/forms/DateFilter";
import { NoteForm, type NoteFormData } from "../../../components/notes/NoteForm";
import { NotePopup } from "../../../components/notes/NotePopup";
import { Search } from "../../../components/forms/Search";
import { Layout } from "../../../components/layout/Layout";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { PageSeo } from "../../../components/PageSeo";
import { useLazyGetNotesQuery, useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation } from "../../../services/apis/user/NoteAPIs";
import type { NoteResponseDto } from "../../../types/dtos/NoteDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { formatDate, formatDateInputValue } from "../../../utils/Formatter";
import styles from "./NotesPage.module.css";

export const NotesPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState(new Date().toLocaleDateString("en-CA"));
    const [dateTo, setDateTo] = useState("");
    const [notes, setNotes] = useState<NoteResponseDto[]>([]);
    const [editingNote, setEditingNote] = useState<NoteResponseDto | null>(null);
    const [viewedNote, setViewedNote] = useState<NoteResponseDto | null>(null);
    const [noteToDelete, setNoteToDelete] = useState<NoteResponseDto | null>(null);
    const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
    const [getNotes] = useLazyGetNotesQuery();
    const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
    const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
    const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

    const fetchNotes = useCallback(async () => {
        try {
            const result = await getNotes({
                data: {
                    query: searchQuery || undefined,
                    date_from: dateFrom || undefined,
                    date_to: dateTo || undefined,
                },
            }).unwrap();
            setNotes(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [dateFrom, dateTo, getNotes, searchQuery]);

    useAuthQuery(fetchNotes);

    const filteredNotes = useMemo(() => notes, [notes]);

    const handleSaveNote = async (data: NoteFormData) => {
        let result: NoteResponseDto | undefined;
        if (editingNote?.id) {
            result = (await updateNote({ note_id: editingNote.id, ...data }).unwrap()).data;
        } else {
            result = (await createNote(data).unwrap()).data;
        }
        if (result) {
            setNotes((current) => {
                if (editingNote?.id) return current.map((item) => item.id === result?.id ? result : item);
                return [result, ...current];
            });
        }
        setEditingNote(null);
        setIsNoteFormOpen(false);
    };

    const handleDeleteNote = async () => {
        if (!noteToDelete?.id) return;
        try {
            await deleteNote({ note_id: noteToDelete.id }).unwrap();
            setNotes((current) => current.filter((item) => item.id !== noteToDelete.id));
            setNoteToDelete(null);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const busy = isCreating || isUpdating || isDeleting;

    return (
        <Layout>
            <PageSeo title="Notes - CU Portal" description="View and manage your personal notes" />
            <Banner title="My Notes" description="Keep your personal notes organized" button="Create Note" buttonAction={() => { setEditingNote(null); setIsNoteFormOpen(true); }} />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}><Search placeholder="Search notes..." setValue={setSearchQuery} /></div>
                    <div className={styles.filtersRow}>
                        <DateFilter placeholder="Date From" setValue={setDateFrom} defaultDate={dateFrom} />
                        <DateFilter placeholder="Date To" setValue={setDateTo} />
                    </div>
                </div>
                <div className={styles.notesGrid}>
                    {filteredNotes.map((note) => (
                        <Card key={note.id} title={note.title || "Untitled note"} badge="Note" items={[{ icon: "calendar", label: "Date", value: formatDate(note.date) }, { icon: "calendar", label: "Created At", value: formatDate(note.created_at) }]} hasOptions button="View Note" buttonAction={() => setViewedNote(note)} editable={!busy} deletable={!busy} onEdit={() => { setEditingNote(note); setIsNoteFormOpen(true); }} onDelete={() => setNoteToDelete(note)} />
                    ))}
                </div>
                {filteredNotes.length === 0 && <NoContentSection icon="note-sticky" label="No notes found" />}
            </div>
            <NoteForm isOpen={isNoteFormOpen} dateStr={editingNote?.date || dateFrom} note={editingNote} onClose={() => { if (!busy) { setIsNoteFormOpen(false); setEditingNote(null); } }} onSave={handleSaveNote} />
            <NotePopup isOpen={!!viewedNote} note={viewedNote} onClose={() => setViewedNote(null)} />
            <ConfirmModal isOpen={!!noteToDelete} onClose={() => setNoteToDelete(null)} onConfirm={handleDeleteNote} confirmText="Delete" title="Delete Note?" message={`Are you sure you want to delete "${noteToDelete?.title}"?`} colorType="red" />
        </Layout>
    );
};
