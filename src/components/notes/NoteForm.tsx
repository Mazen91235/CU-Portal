import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FloatingForm } from "../forms/FloatingForm";
import { Input } from "../forms/Input";
import { Button } from "../forms/Button";
import type { NoteResponseDto, NoteCreateDto } from "../../types/dtos/NoteDtos";
import styles from "./NoteForm.module.css";
import { handleErrors } from "../../utils/ErrorHandling";
import { formatDateInputValue, toIsoFormat } from "../../utils/Formatter";

export type NoteFormData = NoteCreateDto;

export const NoteForm = ({
    isOpen,
    dateStr,
    note,
    onClose,
    onSave,
}: {
    isOpen: boolean;
    dateStr: string;
    note?: NoteResponseDto | null;
    onClose: () => void;
    onSave: (data: NoteFormData) => Promise<void> | void;
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        setError,
    } = useForm<NoteFormData>({
        defaultValues: { title: "", content: "", date: "" },
    });

    useEffect(() => {
        reset({
            title: note?.title || "",
            content: note?.content || "",
            date: note?.date
                ? formatDateInputValue(note.date)
                : /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
                  ? dateStr
                  : "",
        });
    }, [note, reset, isOpen, dateStr]);

    const submit = async (data: NoteFormData) => {
        setIsSubmitting(true);
        try {
            await onSave({
                ...data,
                date: toIsoFormat(data.date),
            });
        } catch (error) {
            handleErrors(error, setError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FloatingForm
            isOpen={isOpen}
            onSubmit={handleSubmit(submit)}
            errors={errors}
            title={note ? "Edit Note" : `Add Note ${dateStr ? `for ${dateStr}` : ""}`}
            onClose={isSubmitting ? undefined : onClose}
            className={styles["note-modal"]}
            disabled={isSubmitting}
        >
            <Input
                register={register}
                name="title"
                type="text"
                placeholder="Note title"
                errors={errors}
                label="Title *"
                maxLength={100}
                disabled={isSubmitting}
                registerOptions={{
                    required: "A title is required",
                    maxLength: { value: 100, message: "Title must be 100 characters or less" },
                }}
            />
            <Input
                register={register}
                name="content"
                type="text"
                placeholder="Write your note..."
                errors={errors}
                label="Note *"
                isTextArea
                maxLength={2000}
                disabled={isSubmitting}
                registerOptions={{
                    required: "Note content is required",
                    maxLength: { value: 2000, message: "Note must be 2000 characters or less" },
                }}
            />
            <Input
                register={register}
                name="date"
                type="date"
                placeholder="Date"
                errors={errors}
                label="Date"
                disabled={isSubmitting}
                registerOptions={{ required: false }}
            />
            <Button
                text={note ? "Update Note" : "Save Note"}
                loadingText="Saving..."
                isSubmitting={isSubmitting}
                isOrange={false}
            />
        </FloatingForm>
    );
};
