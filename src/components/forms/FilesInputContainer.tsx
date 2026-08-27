import { useState, useRef, useEffect } from "react";
import type {
    FieldErrors,
    UseFormRegister,
    Path,
    UseFormSetValue,
} from "react-hook-form";
import type { FileData } from "../../types/entities/Task";
import styles from "./FilesInputContainer.module.css";

export type FileDataWithExisting = FileData & {
    url?: string;
    isExisting?: boolean;
};

export const FilesInputContainer = <T extends Record<string, unknown>>({
    register,
    name,
    errors,
    setValue,
    existingFiles,
    setExistingFiles,
    disabled,
}: {
    register: UseFormRegister<T>;
    name: Path<T>;
    errors: FieldErrors<T>;
    setValue: UseFormSetValue<T>;
    existingFiles?: FileDataWithExisting[];
    setExistingFiles?: (files: FileDataWithExisting[]) => void;
    disabled?: boolean;
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const [existingFilesList, setExistingFilesList] = useState<
        FileDataWithExisting[]
    >(existingFiles || []);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (existingFiles) {
            setExistingFilesList(existingFiles);
        }
    }, [existingFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const updatedFiles = [...files];

            newFiles.forEach((file) => {
                if (
                    !updatedFiles.some(
                        (f) => f.name === file.name && f.size === file.size,
                    )
                ) {
                    updatedFiles.push(file);
                }
            });

            setFiles(updatedFiles);
            updateFormValue(updatedFiles);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const updateFormValue = (fileList: File[]) => {
        const dataTransfer = new DataTransfer();
        fileList.forEach((file) => dataTransfer.items.add(file));
        // @ts-expect-error - FileList type is correct but doesn't match generic form type
        setValue(name, dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;
        const droppedFiles = Array.from(e.dataTransfer.files);
        const updatedFiles = [...files];

        droppedFiles.forEach((file) => {
            if (
                !updatedFiles.some(
                    (f) => f.name === file.name && f.size === file.size,
                )
            ) {
                updatedFiles.push(file);
            }
        });

        setFiles(updatedFiles);
        updateFormValue(updatedFiles);
    };

    const removeFile = (index: number) => {
        if (disabled) return;
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        updateFormValue(updatedFiles);
    };

    const removeExistingFile = (index: number) => {
        if (disabled) return;
        const updatedExisting = existingFilesList.filter((_, i) => i !== index);
        setExistingFilesList(updatedExisting);
        if (setExistingFiles) {
            setExistingFiles(updatedExisting);
        }
    };

    const handleBrowseClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>Attached Files</label>
            <div
                className={`${styles.fileDrop} ${isDragging ? styles.dragging : ""} ${disabled ? styles.disabled : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <i
                    className="fa fa-upload"
                    style={{ fontSize: "1.5rem", marginBottom: "8px" }}
                ></i>
                <span>Drag & drop files here, or click to browse</span>
                <input
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    {...register(name, {
                        onChange: handleFileChange,
                    })}
                    ref={(e) => {
                        register(name).ref(e);
                        fileInputRef.current = e;
                    }}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className={styles.browseBtn}
                    onClick={handleBrowseClick}
                    disabled={disabled}
                >
                    Choose Files
                </button>
            </div>

            {errors[name] && (
                <span className={styles.error}>
                    {errors[name]?.message as string}
                </span>
            )}

            <div className={styles.uploadedFilesList}>
                {existingFilesList.map((file, index) => (
                    <div
                        key={`existing-${index}`}
                        className={styles.uploadedFileItem}
                    >
                        <span
                            className={styles.uploadedFileName}
                            title={file.name}
                        >
                            {file.name}
                        </span>
                        <button
                            type="button"
                            className={styles.removeUploadBtn}
                            onClick={() => removeExistingFile(index)}
                            disabled={disabled}
                        >
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                ))}
                {files.map((file, index) => (
                    <div
                        key={`new-${index}`}
                        className={styles.uploadedFileItem}
                    >
                        <span
                            className={styles.uploadedFileName}
                            title={file.name}
                        >
                            {file.name}
                        </span>
                        <button
                            type="button"
                            className={styles.removeUploadBtn}
                            onClick={() => removeFile(index)}
                            disabled={disabled}
                        >
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
