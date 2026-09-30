import { useEffect, useMemo, useRef, useState } from "react";
import type { WeekResponseDto } from "../../types/dtos/WeekDtos";
import type { WeekItemMutationDto } from "../../types/dtos/WeekItemDtos";
import { Button } from "../forms/Button";
import { Input } from "../forms/Input";
import { Select } from "../forms/Select";
import { formatWeekLabel } from "../../utils/WeekHelpers";
import styles from "./WeekItemsEditor.module.css";

type EditorMode = "attach" | "edit";

export function WeekItemsEditor({
    value,
    onChange,
    availableWeeks,
    loading = false,
    disabled = false,
}: {
    value: WeekItemMutationDto[];
    onChange: (value: WeekItemMutationDto[]) => void;
    availableWeeks: WeekResponseDto[];
    loading?: boolean;
    disabled?: boolean;
}) {
    const [editWeeksOpen, setEditWeeksOpen] = useState(false);
    const [associationEditor, setAssociationEditor] = useState<{
        mode: EditorMode;
        index: number | null;
    } | null>(null);
    const [draftWeekId, setDraftWeekId] = useState<number | "">("");
    const [draftNote, setDraftNote] = useState("");
    const optionsRef = useRef<HTMLDivElement>(null);
    const [openOptionsIndex, setOpenOptionsIndex] = useState<number | null>(
        null,
    );

    const normalizedWeeks = useMemo(
        () =>
            availableWeeks.filter(
                (week) => week.id != null && week.week_number != null,
            ),
        [availableWeeks],
    );

    useEffect(() => {
        if (openOptionsIndex === null) return;

        const handleDocumentClick = (event: MouseEvent) => {
            if (
                event.target instanceof Node &&
                optionsRef.current &&
                !optionsRef.current.contains(event.target)
            ) {
                setOpenOptionsIndex(null);
            }
        };

        document.addEventListener("click", handleDocumentClick);
        return () => document.removeEventListener("click", handleDocumentClick);
    }, [openOptionsIndex]);

    const closeAssociationEditor = () => {
        if (disabled) return;
        setAssociationEditor(null);
        setDraftWeekId("");
        setDraftNote("");
    };

    const openAttachEditor = () => {
        if (disabled || loading || normalizedWeeks.length === 0) return;
        setOpenOptionsIndex(null);
        setDraftWeekId("");
        setDraftNote("");
        setAssociationEditor({ mode: "attach", index: null });
    };

    const openEditEditor = (index: number) => {
        if (disabled) return;
        const item = value[index];
        if (!item) return;
        setOpenOptionsIndex(null);
        setDraftWeekId(item.week_id);
        setDraftNote(item.note || "");
        setAssociationEditor({ mode: "edit", index });
    };

    const deleteWeekItem = (index: number) => {
        if (disabled) return;
        onChange(value.filter((_, itemIndex) => itemIndex !== index));
        setOpenOptionsIndex(null);
    };

    const saveAssociation = (event: React.FormEvent) => {
        console.log("saveAssociation called");
        event.preventDefault();
        if (disabled || draftWeekId === "") return;

        const nextItem: WeekItemMutationDto = {
            week_id: Number(draftWeekId),
            note: draftNote.trim() || undefined,
        };

        if (
            associationEditor?.mode === "edit" &&
            associationEditor.index !== null
        ) {
            const nextValue = [...value];
            nextValue[associationEditor.index] = nextItem;
            onChange(nextValue);
        } else if (associationEditor?.mode === "attach") {
            onChange([...value, nextItem]);
        }

        setAssociationEditor(null);
        setDraftWeekId("");
        setDraftNote("");
    };

    const selectedWeekIds = useMemo(
        () =>
            new Set(
                value
                    .filter((_, index) => index !== associationEditor?.index)
                    .map((item) => item.week_id),
            ),
        [associationEditor?.index, value],
    );

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Weeks</span>
                <Button
                    text="Edit Weeks"
                    loadingText="Loading..."
                    isOrange={false}
                    type="button"
                    className={styles.editWeeksButton}
                    onClick={() => setEditWeeksOpen(true)}
                    isSubmitting={disabled || loading}
                />
            </div>

            <div className={styles.attachedWeeks}>
                {loading ? (
                    <span className={styles.emptyText}>Loading weeks...</span>
                ) : value.length === 0 ? (
                    <span className={styles.emptyText}>No Weeks Attached</span>
                ) : (
                    value.map((item, index) => {
                        const week = normalizedWeeks.find(
                            (availableWeek) =>
                                availableWeek.id === item.week_id,
                        );
                        return (
                            <div
                                key={`${item.week_id}-${index}`}
                                className={styles.attachedWeek}
                            >
                                {formatWeekLabel(week)}
                            </div>
                        );
                    })
                )}
            </div>

            {editWeeksOpen && (
                <div
                    className={styles.overlay}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (event.target === event.currentTarget) {
                            setEditWeeksOpen(false);
                            setOpenOptionsIndex(null);
                        }
                    }}
                >
                    <div
                        className={styles.modal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h2>Edit Weeks</h2>
                            <div className={styles.modalHeaderActions}>
                                <Button
                                    text="Attach a Week"
                                    loadingText="Loading..."
                                    isOrange={false}
                                    type="button"
                                    className={styles.attachButton}
                                    onClick={openAttachEditor}
                                    isSubmitting={
                                        disabled ||
                                        loading ||
                                        normalizedWeeks.length === 0
                                    }
                                />
                                <button
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={() => {
                                        setEditWeeksOpen(false);
                                        setOpenOptionsIndex(null);
                                    }}
                                    disabled={disabled}
                                    aria-label="Close Edit Weeks"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className={styles.modalBody}>
                            {value.length === 0 ? (
                                <div className={styles.emptyList}>
                                    No Weeks Attached
                                </div>
                            ) : (
                                value.map((item, index) => {
                                    const week = normalizedWeeks.find(
                                        (availableWeek) =>
                                            availableWeek.id === item.week_id,
                                    );
                                    return (
                                        <div
                                            key={`${item.week_id}-${index}`}
                                            className={styles.weekItem}
                                        >
                                            <div
                                                className={
                                                    styles.weekItemContent
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.weekItemTitle
                                                    }
                                                >
                                                    {formatWeekLabel(week)}
                                                </div>
                                                {item.note?.trim() && (
                                                    <div
                                                        className={
                                                            styles.weekItemNote
                                                        }
                                                    >
                                                        {item.note}
                                                    </div>
                                                )}
                                            </div>
                                            <div
                                                ref={
                                                    openOptionsIndex === index
                                                        ? optionsRef
                                                        : undefined
                                                }
                                                className={
                                                    styles.optionsContainer
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.optionsButton
                                                    }
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setOpenOptionsIndex(
                                                            (current) =>
                                                                current ===
                                                                index
                                                                    ? null
                                                                    : index,
                                                        );
                                                    }}
                                                    aria-label="More options"
                                                    disabled={disabled}
                                                >
                                                    <span aria-hidden="true">
                                                        ⋮
                                                    </span>
                                                </button>
                                                {openOptionsIndex === index && (
                                                    <div
                                                        className={
                                                            styles.optionsMenu
                                                        }
                                                    >
                                                        <button
                                                            type="button"
                                                            className={
                                                                styles.optionItem
                                                            }
                                                            onClick={() =>
                                                                openEditEditor(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className={`${styles.optionItem} ${styles.deleteOption}`}
                                                            onClick={() =>
                                                                deleteWeekItem(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                text="Cancel"
                                loadingText="Canceling..."
                                isSubmitting={false}
                                isDefault
                                onClick={() => {
                                    setEditWeeksOpen(false);
                                    setOpenOptionsIndex(null);
                                }}
                                className={styles.doneButton}
                            />
                        </div>
                    </div>
                </div>
            )}

            {associationEditor && (
                <div
                    className={styles.overlayNested}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (event.target === event.currentTarget) {
                            closeAssociationEditor();
                        }
                    }}
                >
                    <form
                        className={styles.editorModal}
                        onClick={(event) => event.stopPropagation()}
                        onSubmit={saveAssociation}
                    >
                        <div className={styles.editorHeader}>
                            <h2>
                                {associationEditor.mode === "attach"
                                    ? "Attach a Week"
                                    : "Edit Week"}
                            </h2>
                            <button
                                type="button"
                                className={styles.closeButton}
                                onClick={closeAssociationEditor}
                                disabled={disabled}
                            >
                                ×
                            </button>
                        </div>

                        <Select<Record<string, unknown>>
                            name="week_id"
                            errors={{}}
                            value={draftWeekId}
                            onChange={(event) =>
                                setDraftWeekId(
                                    event.target.value
                                        ? Number(event.target.value)
                                        : "",
                                )
                            }
                            label="Week"
                            disabled={disabled || loading}
                        >
                            <option value="">Select a week</option>
                            {normalizedWeeks.map((week) => (
                                <option
                                    key={week.id}
                                    value={week.id ?? ""}
                                    disabled={
                                        week.id != null &&
                                        selectedWeekIds.has(week.id)
                                    }
                                >
                                    {formatWeekLabel(week)}
                                </option>
                            ))}
                        </Select>

                        <Input<Record<string, unknown>>
                            name="note"
                            type="text"
                            errors={{}}
                            value={draftNote}
                            onChange={(event) =>
                                setDraftNote(event.target.value)
                            }
                            label="Note"
                            placeholder="Add a note for this week..."
                            isTextArea
                            disabled={disabled}
                        />

                        <div className={styles.editorActions}>
                            <Button
                                type="button"
                                text="Cancel"
                                loadingText="Canceling..."
                                isSubmitting={false}
                                isDefault
                                onClick={closeAssociationEditor}
                            />
                            <Button
                                type="submit"
                                text={
                                    associationEditor.mode === "attach"
                                        ? "Attach"
                                        : "Update"
                                }
                                loadingText={
                                    associationEditor.mode === "attach"
                                        ? "Attaching..."
                                        : "Updating..."
                                }
                                isSubmitting={false}
                                isOrange={false}
                                disabled={draftWeekId === "" || disabled}
                            />
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
