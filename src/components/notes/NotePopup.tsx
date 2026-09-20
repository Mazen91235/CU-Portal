import type { NoteResponseDto } from "../../types/dtos/NoteDtos";
import { formatDate, formatString } from "../../utils/Formatter";
import styles from "./NotePopup.module.css";

export const NotePopup = ({
    note,
    isOpen,
    onClose,
}: {
    note: NoteResponseDto | null;
    isOpen: boolean;
    onClose: () => void;
}) => {
    if (!isOpen || !note) return null;

    return (
        <div
            className={styles.overlay}
            onClick={(event) => {
                event.stopPropagation();
                onClose();
            }}
        >
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <span className={styles.badge}>Note</span>
                        <h2>{formatString(note.title || "Untitled note", "PageTitle")}</h2>
                    </div>
                    <button type="button" className={styles.close} onClick={onClose}>
                        ×
                    </button>
                </div>
                {note.date && <div className={styles.date}>{formatDate(note.date)}</div>}
                <div className={styles.content}>{formatString(note.content || "", "Content")}</div>
            </div>
        </div>
    );
};
