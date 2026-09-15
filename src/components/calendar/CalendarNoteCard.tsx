import { useEffect, useRef, useState } from "react";
import type { NoteResponseDto } from "../../types/dtos/NoteDtos";
import { formatDate, formatString } from "../../utils/Formatter";
import styles from "./CalendarNoteCard.module.css";

const getPreview = (content?: string | null) => {
    const value = content || "";
    return value.length > 50 ? `${value.slice(0, 50)}...` : value;
};

export const CalendarNoteCard = ({
    note,
    onView,
    onEdit,
    onDelete,
    disabled = false,
    viewButtonPlacement = "center",
}: {
    note: NoteResponseDto;
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    disabled?: boolean;
    viewButtonPlacement?: "center" | "inline";
}) => {
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const optionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showOptionsMenu) return;

        const handleDocumentClick = (event: MouseEvent) => {
            if (
                event.target instanceof Node &&
                optionsRef.current &&
                !optionsRef.current.contains(event.target)
            ) {
                setShowOptionsMenu(false);
            }
        };

        document.addEventListener("click", handleDocumentClick);
        return () => document.removeEventListener("click", handleDocumentClick);
    }, [showOptionsMenu]);

    const handleOption = (action?: () => void) => {
        if (disabled) return;
        setShowOptionsMenu(false);
        action?.();
    };

    return (
        <article className={styles.card}>
            {(onEdit || onDelete) && (
                <div ref={optionsRef} className={styles.optionsContainer}>
                    <button
                        type="button"
                        className={styles.optionsButton}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (!disabled) setShowOptionsMenu((current) => !current);
                        }}
                        aria-label="More options"
                        disabled={disabled}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <circle cx="10" cy="4" r="1.5" fill="#666" />
                            <circle cx="10" cy="10" r="1.5" fill="#666" />
                            <circle cx="10" cy="16" r="1.5" fill="#666" />
                        </svg>
                    </button>
                    {showOptionsMenu && (
                        <div className={styles.optionsMenu}>
                            {onEdit && (
                                <button type="button" onClick={() => handleOption(onEdit)} className={styles.optionItem}>
                                    Edit
                                </button>
                            )}
                            {onDelete && (
                                <button type="button" onClick={() => handleOption(onDelete)} className={styles.optionItem}>
                                    Delete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className={styles.content}>
                <div className={styles.titleRow}>
                    <h4 className={styles.title}>{formatString(note.title || "Untitled note", "CalendarCardTitle")}</h4>
                    <span className={styles.badge}>Note</span>
                </div>
                <p className={styles.preview}>{formatString(getPreview(note.content), "CalendarCardContent")}</p>
                <div className={`${styles.footer} ${viewButtonPlacement === "inline" ? styles.footerInline : styles.footerCenter}`}>
                    {note.date && <div className={styles.date}>{formatDate(note.date)}</div>}
                    {onView && (
                        <button
                            type="button"
                            className={styles.viewButton}
                            onClick={onView}
                            disabled={disabled}
                        >
                            View
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};
