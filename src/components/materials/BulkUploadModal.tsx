import { useState } from "react";
import {
    useUploadFileToDriveChunked,
    useRemoveUploadedFiles,
} from "../../hooks/useHandleProcesses";
import { formatFileSize } from "../../utils/Formatter";
import type { Process } from "../../types/Process";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import styles from "./BulkUploadModal.module.css";

type BulkUploadModalProps = {
    files: File[];
    onClose: () => void;
    onMaterialCreate: (uploadResult: Process) => Promise<void>;
};

export function BulkUploadModal({
    files: initialFiles,
    onClose,
    onMaterialCreate,
}: BulkUploadModalProps) {
    const [files, setFiles] = useState<File[]>(initialFiles);
    const uploadFileToDrive = useUploadFileToDriveChunked({});
    const removeUploadedFiles = useRemoveUploadedFiles();
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            setFiles((prev) => {
                const filtered = prev.filter(
                    (file) =>
                        !droppedFiles.some(
                            (droppedFile) => droppedFile.name === file.name,
                        ),
                );
                return [...filtered, ...droppedFiles];
            });
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const handleSubmit = async () => {
        if (files.length === 0 || isUploading) return;

        setIsUploading(true);
        onClose();
        try {
            for (const file of files) {
                const result = await uploadFileToDrive(file, file.name);
                if (!result?.url) continue;
                try {
                    await onMaterialCreate(result);
                } catch (error) {
                    await removeUploadedFiles([result.url]);
                    throw error;
                }
            }
        } catch (error) {
            handlePopupErrors(error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Upload Files</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className={styles.content}>
                    <div
                        className={`${styles.dropArea} ${isDragOver ? styles.dragover : ""}`}
                        onDragOver={handleDragOver}
                        onMouseLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <p>Drag more files here or click to browse</p>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileInput}
                            className={styles.fileInput}
                        />
                    </div>

                    <div className={styles.filesList}>
                        <div className={styles.filesHeader}>
                            <span>
                                {files.length} file
                                {files.length !== 1 ? "s" : ""} selected
                            </span>
                        </div>
                        <div className={styles.filesScroll}>
                            {files.map((file, index) => (
                                <div key={index} className={styles.fileItem}>
                                    <div className={styles.fileIcon}>
                                        <i className="far fa-file"></i>
                                    </div>
                                    <div className={styles.fileInfo}>
                                        <span className={styles.fileName}>
                                            {file.name}
                                        </span>
                                        <span className={styles.fileSize}>
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveFile(index)}
                                        title="Remove file"
                                    >
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.cancelBtn}
                        onClick={onClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={files.length === 0 || isUploading}
                    >
                        <i className="fa-solid fa-upload me-2"></i>
                        Upload {files.length} file
                        {files.length !== 1 ? "s" : ""}
                    </button>
                </div>
            </div>
        </div>
    );
}
