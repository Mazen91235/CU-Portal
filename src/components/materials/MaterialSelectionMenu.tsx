import IconComponent from "../IconComponent";
import styles from "./MaterialSelectionMenu.module.css";

type MaterialSelectionMenuProps = {
    isSelectionMode: boolean;
    selectedCount: number;
    totalCount: number;
    showCopy?: boolean;
    showMove?: boolean;
    showDelete?: boolean;
    onSelectAll: () => void;
    onDownload: () => void;
    onCopy?: () => void;
    onMove?: () => void;
    onDelete?: () => void;
    onCancel: () => void;
    onEnter: () => void;
};

export const MaterialSelectionMenu = ({
    isSelectionMode,
    selectedCount,
    totalCount,
    showCopy = false,
    showMove = false,
    showDelete = false,
    onSelectAll,
    onDownload,
    onCopy,
    onMove,
    onDelete,
    onCancel,
    onEnter,
}: MaterialSelectionMenuProps) => {
    const hasSelection = selectedCount > 0;
    const allSelected = totalCount > 0 && selectedCount === totalCount;

    return (
        <div className={styles.wrapper}>
            {isSelectionMode && (
                <div className={styles.menu}>
                    <button
                        type="button"
                        className={styles.action}
                        onClick={onSelectAll}
                        title={allSelected ? "Clear selection" : "Select all"}
                    >
                        <IconComponent icon="select-all" size={20} />
                        <span>
                            {allSelected ? "Clear selection" : "Select all"}
                        </span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.action} ${!hasSelection ? styles.disabled : ""}`}
                        onClick={hasSelection ? onDownload : undefined}
                        disabled={!hasSelection}
                        title="Download"
                    >
                        <IconComponent icon="download" size={20} />
                        <span>Download</span>
                    </button>
                    {(showCopy || showMove || showDelete) && (
                        <>
                            {showCopy && (
                                <button
                                    type="button"
                                    className={`${styles.action} ${!hasSelection ? styles.disabled : ""}`}
                                    onClick={hasSelection ? onCopy : undefined}
                                    disabled={!hasSelection}
                                    title="Copy"
                                >
                                    <IconComponent icon="copy" size={20} />
                                    <span>Copy</span>
                                </button>
                            )}
                            {showMove && (
                                <button
                                    type="button"
                                    className={`${styles.action} ${!hasSelection ? styles.disabled : ""}`}
                                    onClick={hasSelection ? onMove : undefined}
                                    disabled={!hasSelection}
                                    title="Move"
                                >
                                    <IconComponent icon="move" size={20} />
                                    <span>Move</span>
                                </button>
                            )}
                            {showDelete && (
                                <button
                                    type="button"
                                    className={`${styles.action} ${!hasSelection ? styles.disabled : styles.danger}`}
                                    onClick={
                                        hasSelection ? onDelete : undefined
                                    }
                                    disabled={!hasSelection}
                                    title="Delete"
                                >
                                    <IconComponent icon="delete" size={20} />
                                    <span>Delete</span>
                                </button>
                            )}
                        </>
                    )}
                </div>
            )}

            {isSelectionMode && hasSelection && (
                <span className={styles.count}>{selectedCount}</span>
            )}

            <button
                type="button"
                className={`${styles.trigger} ${isSelectionMode ? styles.cancel : ""}`}
                onClick={isSelectionMode ? onCancel : onEnter}
                title={
                    isSelectionMode ? "Cancel selection" : "Select materials"
                }
                aria-label={
                    isSelectionMode ? "Cancel selection" : "Select materials"
                }
            >
                <IconComponent
                    icon={isSelectionMode ? "close" : "select"}
                    size={22}
                />
            </button>
        </div>
    );
};
