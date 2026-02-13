import React, { useEffect, useState } from "react";
import type { Material } from "../../types/entities/Material";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import styles from "./FloatingContainer.module.css";

interface FloatingContainerProps {
    operation: "copy" | "move";
    materials: Material[];
    selectedMaterials: number[];
    currentPath: Material[];
    folders: Material[];
    initialTargetId: number | null | undefined;
    onClose: () => void;
    onConfirm: (targetId: number | null) => void;
    onNavigate: (folderId: number | null) => void;
    onCreateFolder: (name: string, parentId: number | null) => Promise<void>;
}

export function FloatingContainer({
    operation,
    materials,
    selectedMaterials,
    currentPath,
    folders,
    initialTargetId,
    onClose,
    onConfirm,
    onNavigate,
    onCreateFolder,
}: FloatingContainerProps) {
    const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    const selectedMaterialsData = materials.filter(
        (m) => m.id && selectedMaterials.includes(m.id),
    );
    const currentFolderId =
        currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;

    useEffect(() => {
        setSelectedTarget(initialTargetId || null);
    }, [initialTargetId]);

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
        setSelectedTarget(folderId);
    };

    const handleRootClick = () => {
        onNavigate(null);
        setSelectedTarget(null);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            return;
        }
        try {
            setIsLoading(true);
            await onCreateFolder(newFolderName.trim(), currentFolderId ?? null);
            setNewFolderName("");
            setIsCreatingFolder(false);
        } catch (error) {
            handlePopupErrors(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelCreateFolder = () => {
        setNewFolderName("");
        setIsCreatingFolder(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCreateFolder();
        } else if (e.key === "Escape") {
            handleCancelCreateFolder();
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.container}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h3 className={styles.dialogTitle}>
                        {operation === "copy" ? "Copy" : "Move"}{" "}
                        {selectedMaterials.length} Material
                        {selectedMaterials.length !== 1 ? "s" : ""} to...
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

                <div className={styles.navigationPath}>
                    <div className={styles.pathSegment}>
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                        Materials
                    </div>
                    <div className={styles.pathSeparator}>{">"}</div>
                    <div
                        className={`${styles.pathSegment} ${!currentPath.length ? styles.active : ""}`}
                        onClick={handleRootClick}
                        style={{
                            cursor:
                                currentFolderId === null
                                    ? "default"
                                    : "pointer",
                        }}
                    >
                        Subject Root
                    </div>
                    {currentPath.map((folder, index) => (
                        <React.Fragment key={folder.id}>
                            <div className={styles.pathSeparator}>{">"}</div>
                            <div
                                className={`${styles.pathSegment} ${index === currentPath.length - 1 ? styles.active : ""}`}
                                onClick={() =>
                                    index !== currentPath.length - 1 &&
                                    folder.id &&
                                    onNavigate(folder.id)
                                }
                                style={{
                                    cursor:
                                        index === currentPath.length - 1
                                            ? "default"
                                            : "pointer",
                                }}
                            >
                                {folder.name}
                            </div>
                        </React.Fragment>
                    ))}
                    <button
                        className={styles.newFolderBtn}
                        onClick={() => setIsCreatingFolder(true)}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Folder
                    </button>
                </div>

                {isCreatingFolder && (
                    <div className={styles.addFolderContainer}>
                        <input
                            type="text"
                            className={styles.newFolderInput}
                            placeholder="Folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={isLoading}
                            autoFocus
                        />
                        <div className={styles.newFolderActions}>
                            <button
                                className={styles.createButton}
                                onClick={handleCreateFolder}
                                disabled={!newFolderName.trim() || isLoading}
                            >
                                Create
                            </button>
                            <button
                                className={styles.cancelCreateButton}
                                onClick={handleCancelCreateFolder}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.folderList}>
                    {folders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <svg
                                width="64"
                                height="64"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                            <h3>No Folders Found.</h3>
                            <p>
                                Create a new folder or just leave materials
                                here.
                            </p>
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
                                <div className={styles.folderIcon}>
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
                                </div>
                                <span className={styles.folderName}>
                                    {folder.name && folder.name.length > 20
                                        ? folder.name.substring(0, 15) +
                                          "..." +
                                          folder.name.substring(
                                              folder.name.length - 5,
                                          )
                                        : folder.name || "Untitled"}
                                </span>
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
                    >
                        {operation === "copy" ? "Copy Here" : "Move Here"}
                    </button>
                </div>
            </div>
        </div>
    );
}
