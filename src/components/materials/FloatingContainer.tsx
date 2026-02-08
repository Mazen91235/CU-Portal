import { useState } from "react";
import type { Material } from "../../types/entities/Material";
import styles from "./FloatingContainer.module.css";

interface FloatingContainerProps {
    operation: "copy" | "move";
    materials: Material[];
    selectedMaterials: number[];
    currentPath: Material[];
    folders: Material[];
    onClose: () => void;
    onConfirm: (targetId: number | null) => void;
    onNavigate: (folderId: number | null) => void;
}

export function FloatingContainer({
    operation,
    materials,
    selectedMaterials,
    currentPath,
    folders,
    onClose,
    onConfirm,
    onNavigate,
}: FloatingContainerProps) {
    const [selectedTarget, setSelectedTarget] = useState<number | null>(null);

    const selectedMaterialsData = materials.filter(
        (m) => m.id && selectedMaterials.includes(m.id),
    );
    const currentFolderId =
        currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;

    const handleConfirm = () => {
        onConfirm(selectedTarget);
    };

    const handleFolderClick = (folderId: number) => {
        if (selectedTarget === folderId) {
            setSelectedTarget(null);
        } else {
            setSelectedTarget(folderId);
        }
    };

    const handleFolderDoubleClick = (folderId: number) => {
        onNavigate(folderId);
        setSelectedTarget(null);
    };

    const handleBackClick = () => {
        if (currentPath.length > 0) {
            const parentId =
                currentPath.length > 1
                    ? (currentPath[currentPath.length - 2].id ?? null)
                    : null;
            onNavigate(parentId);
            setSelectedTarget(null);
        }
    };

    const handleRootClick = () => {
        onNavigate(null);
        setSelectedTarget(null);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.container}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h3>
                        {operation === "copy" ? "Copy" : "Move"}{" "}
                        {selectedMaterials.length} item(s)
                    </h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className={styles.selectedItems}>
                    {selectedMaterialsData.map((material) => (
                        <div key={material.id} className={styles.selectedItem}>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                {material.type === "folder" ? (
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                ) : (
                                    <>
                                        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                                        <polyline points="13 2 13 9 20 9" />
                                    </>
                                )}
                            </svg>
                            <span>{material.name}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.breadcrumb}>
                    <button
                        className={styles.breadcrumbBtn}
                        onClick={handleRootClick}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                        Home
                    </button>
                    {currentPath.map((folder) => (
                        <div
                            key={folder.id}
                            className={styles.breadcrumbSegment}
                        >
                            <svg
                                className={styles.separator}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                            <span className={styles.breadcrumbText}>
                                {folder.name}
                            </span>
                        </div>
                    ))}
                </div>

                <div className={styles.navigation}>
                    {currentPath.length > 0 && (
                        <button
                            className={styles.backButton}
                            onClick={handleBackClick}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                            Back
                        </button>
                    )}
                    <button
                        className={`${styles.selectCurrentBtn} ${selectedTarget === currentFolderId ? styles.selected : ""}`}
                        onClick={() =>
                            setSelectedTarget(currentFolderId ?? null)
                        }
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Select Current Folder
                    </button>
                </div>

                <div className={styles.folderList}>
                    {folders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                            <p>No folders here</p>
                        </div>
                    ) : (
                        folders.map((folder) => (
                            <div
                                key={folder.id}
                                className={`${styles.folderItem} ${selectedTarget === folder.id ? styles.selectedFolder : ""}`}
                                onClick={() =>
                                    folder.id && handleFolderClick(folder.id)
                                }
                                onDoubleClick={() =>
                                    folder.id &&
                                    handleFolderDoubleClick(folder.id)
                                }
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                                <span className={styles.folderName}>
                                    {folder.name}
                                </span>
                                <svg
                                    className={styles.chevron}
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        ))
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.cancelButton} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                        disabled={selectedTarget === null}
                    >
                        {operation === "copy" ? "Copy Here" : "Move Here"}
                    </button>
                </div>
            </div>
        </div>
    );
}
