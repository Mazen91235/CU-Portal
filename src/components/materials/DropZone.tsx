import { useState, useRef } from "react";
import styles from "./DropZone.module.css";

type DropZoneProps = {
    isVisible: boolean;
    onFilesSelected: (files: File[]) => void;
    onClose: () => void;
};

export function DropZone({
    isVisible,
    onFilesSelected,
    onClose,
}: DropZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isVisible) return null;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onFilesSelected(files);
            onClose();
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                onFilesSelected(files);
                onClose();
            }
        }
    };

    return (
        <div className={styles.overlay}>
            <div
                className={`${styles.dropBox} ${isDragOver ? styles.dragover : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <div className={styles.plusButton}>+</div>
                <p className={styles.mainText}>Drop files Here to Upload</p>
                <p className={styles.subText}>
                    Release to add files to materials
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleFileInputChange}
                />
            </div>
        </div>
    );
}
