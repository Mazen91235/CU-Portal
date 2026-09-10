import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FloatingForm } from "./FloatingForm";
import { Input } from "./Input";
import { Button } from "./Button";
import type { CalendarDayEventDto } from "../../types/dtos/CalendarDtos";
import styles from "./NoteForm.module.css";

export type NoteFormData = {
    title: string;
    content: string;
    created_at: string;
    date?: string;
};

export const NoteForm = ({
    isOpen,
    dateStr,
    note,
    created_at,
    onClose,
    onSave,
}: {
    isOpen: boolean;
    dateStr: string;
    created_at?: string;
    note?: CalendarDayEventDto;
    onClose: () => void;
    onSave: (data: NoteFormData) => void;
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<NoteFormData>({
        defaultValues: { title: "", content: "", created_at: created_at, date: "" },
    });

    useEffect(() => {
        reset({
            title: note?.title || "",
            content: note?.content || "",
            created_at: note?.created_at || created_at,
            date: note?.date || "",
        });
    }, [note, reset, isOpen, created_at]);

    return (
        <FloatingForm
            isOpen={isOpen}
            onSubmit={handleSubmit(onSave)}
            errors={errors}
            title={note ? "Edit Note" : `Add Note ${dateStr && `for ${dateStr}`}`}
            onClose={onClose}
            className={styles["note-modal"]}
        >
            <Input
                register={register}
                name="title"
                type="text"
                placeholder="Note title"
                errors={errors}
                label="Title *"
                maxLength={100}
                registerOptions={{
                    required: "A title is required",
                    maxLength: {
                        value: 100,
                        message: "Title must be 100 characters or less",
                    },
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
                registerOptions={{
                    required: "Note content is required",
                    maxLength: {
                        value: 2000,
                        message: "Note must be 2000 characters or less",
                    },
                }}
            />
            <Input
            register={register}
            name="created_at"
            type="date"
            placeholder="Date"
            errors={errors}
            label="Created At *"
            registerOptions={{ required: created_at ? false : "A creation date is required" }}
            />
            <Input
                register={register}
                name="date"
                type="date"
                placeholder="Date"
                errors={errors}
                label="Date"
                registerOptions={{ required: false }}
            />
            <Button
                text={note ? "Update Note" : "Save Note"}
                loadingText="Saving..."
                isSubmitting={false}
                isOrange={false}
            />
        </FloatingForm>
    );
};
