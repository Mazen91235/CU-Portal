import { useRef, useState, type ChangeEvent } from 'react';
import { FiImage } from 'react-icons/fi';
import styles from './Thumbnail.module.css';


export const Thumbnail = () => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [IsDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Trigger the hidden file input
    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }

    const handleDragLeave = () => {
        setIsDragging(false);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    return (
        <div className={styles.thumbnailContainer}>
        <label className={styles.label}>Thumbnail *</label>
        
        <div 
            className={`${styles.uploadArea} ${IsDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
            type="file"
            accept="image/*"
            className={styles.hiddenInput}
            ref={fileInputRef}
            onChange={handleFileChange}
            />

            {previewUrl ? (
            <div className={styles.previewWrapper}>
                <img src={previewUrl} alt="Thumbnail preview" className={styles.previewImage} />
                <div className={styles.actions}>
                <button type="button" onClick={handleRemove} className={styles.removeBtn}>
                    Remove
                </button>
                <button type="button" onClick={triggerUpload} className={styles.replaceBtn}>
                    Replace
                </button>
                </div>
            </div>
            ) : (
            <div className={styles.emptyState}>
                <div className={styles.iconPlaceholder}>
                <FiImage size={32} /> 
                </div>
                <button type="button" onClick={triggerUpload} className={styles.uploadBtn}>
                Upload
                </button>
            </div>
            )}
        </div>
        </div>
    );
};