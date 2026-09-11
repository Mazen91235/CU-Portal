import { useCallback, useEffect, useState } from "react";
import type { MaterialResponseDto } from "../../types/dtos/MaterialDtos";
import type { SubjectResponseDto } from "../../types/dtos/SubjectDtos";
import { useLazyGetMaterialParentsQuery } from "../../services/apis/user/MaterialAPIs";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import { showToast } from "../../utils/ToastsManager";
import { FloatingContainer } from "./FloatingContainer";
import styles from "./CrossSubjectDestinationPicker.module.css";

type CrossSubjectDestinationPickerProps = {
    materials: MaterialResponseDto[];
    selectedMaterials: number[];
    destinationSubjects: SubjectResponseDto[];
    onClose: () => void;
    onConfirm: (targetId: number) => void;
    // Role-specific data access: admin and user hit different API modules
    // (different base URLs, and users can't create folders at all today),
    // so the picker takes these as injected functions rather than importing
    // a specific role's hooks itself.
    fetchFolders: (
        subjectId: number,
        parentId: number | null | undefined,
    ) => Promise<MaterialResponseDto[]>;
    createFolder?: (
        subjectId: number,
        name: string,
        parentId: number | null,
    ) => Promise<void>;
};

export function CrossSubjectDestinationPicker({
    materials,
    selectedMaterials,
    destinationSubjects,
    onClose,
    onConfirm,
    fetchFolders: fetchFoldersForSubject,
    createFolder,
}: CrossSubjectDestinationPickerProps) {
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
        null,
    );
    const [currentPath, setCurrentPath] = useState<MaterialResponseDto[]>([]);
    const [folders, setFolders] = useState<MaterialResponseDto[]>([]);

    const [getMaterialParents] = useLazyGetMaterialParentsQuery();

    const selectedSubject = destinationSubjects.find(
        (subject) => subject.id === selectedSubjectId,
    );

    const fetchFolders = useCallback(
        async (parentId?: number | null) => {
            if (!selectedSubjectId) return;
            try {
                const result = await fetchFoldersForSubject(
                    selectedSubjectId,
                    parentId,
                );
                setFolders(result);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [selectedSubjectId, fetchFoldersForSubject],
    );

    useEffect(() => {
        if (selectedSubjectId) {
            setCurrentPath([]);
            void fetchFolders(null);
        }
    }, [selectedSubjectId, fetchFolders]);

    const handleNavigate = async (folderId: number | null) => {
        if (folderId === null) {
            setCurrentPath([]);
        } else {
            try {
                const response = await getMaterialParents({
                    material_id: folderId,
                }).unwrap();
                setCurrentPath([...(response.data || [])]);
            } catch (error) {
                handlePopupErrors(error);
            }
        }
        await fetchFolders(folderId);
    };

    const handleCreateFolder = createFolder
        ? async (name: string, parentId: number | null) => {
              if (!selectedSubjectId) return;
              try {
                  await createFolder(selectedSubjectId, name, parentId);
                  await fetchFolders(parentId);
              } catch (error) {
                  handlePopupErrors(error);
              }
          }
        : undefined;

    const handleConfirm = (targetId: number | null) => {
        if (targetId === null) {
            showToast(
                "error",
                "Select a folder",
                "Pick or create a folder inside this subject first — copying straight to a subject's root isn't supported yet.",
            );
            return;
        }
        onConfirm(targetId);
    };

    if (!selectedSubjectId) {
        return (
            <div className={styles.overlay} onClick={onClose}>
                <div
                    className={styles.container}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.header}>
                        <h3 className={styles.title}>
                            Select a destination subject
                        </h3>
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                        >
                            ×
                        </button>
                    </div>
                    <div className={styles.subjectList}>
                        {destinationSubjects.length === 0 ? (
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
                                <h3>No Subjects Found.</h3>
                                <p>
                                    You don&apos;t have any subjects of your
                                    own to copy into.
                                </p>
                            </div>
                        ) : (
                            destinationSubjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className={styles.subjectItem}
                                    onClick={() =>
                                        subject.id &&
                                        setSelectedSubjectId(subject.id)
                                    }
                                >
                                    <div className={styles.subjectIcon}>
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
                                    <span className={styles.subjectName}>
                                        {subject.name}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <FloatingContainer
            operation="copy"
            materials={materials}
            selectedMaterials={selectedMaterials}
            currentPath={currentPath}
            folders={folders}
            initialTargetId={null}
            onClose={onClose}
            onConfirm={handleConfirm}
            onNavigate={handleNavigate}
            onCreateFolder={handleCreateFolder}
            allowCreateFolder={Boolean(createFolder)}
            rootLabel={selectedSubject?.name || "Subject Root"}
            onHomeClick={() => setSelectedSubjectId(null)}
        />
    );
}

export default CrossSubjectDestinationPicker;
