import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type {
    FieldErrors,
    Path,
    UseFormRegister,
    UseFormSetValue,
} from "react-hook-form";
import styles from "./Thumbnail.module.css";

type ThumbnailProps<T extends Record<string, unknown>> = {
    register: UseFormRegister<T>;
    name: Path<T>;
    errors: FieldErrors<T>;
    setValue: UseFormSetValue<T>;
    existingUrl?: string | null;
    onRemoveExisting?: () => void;
    disabled?: boolean;
    required?: boolean;
};

export const Thumbnail = <T extends Record<string, unknown>>({
    register,
    name,
    errors,
    setValue,
    existingUrl,
    onRemoveExisting,
    disabled,
    required = false,
}: ThumbnailProps<T>) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        existingUrl || null,
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const objectUrlRef = useRef<string | null>(null);
    const registration = register(name, {
        required: required ? "Thumbnail is required" : false,
    });

    useEffect(() => {
        setPreviewUrl(existingUrl || null);
    }, [existingUrl]);

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        registration.onChange(e);
        const file = e.target.files?.[0];

        if (!file) return;

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        objectUrlRef.current = URL.createObjectURL(file);
        setPreviewUrl(objectUrlRef.current);
        onRemoveExisting?.();
        setValue(name, e.target.files as unknown as T[Path<T>], {
            shouldValidate: true,
        });
    };

    const handleRemove = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        setPreviewUrl(null);
        setValue(name, undefined as T[Path<T>], {
            shouldValidate: true,
            shouldDirty: true,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onRemoveExisting?.();
    };

    const triggerUpload = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={styles.thumbnailContainer}>
            <label className={styles.label}>
                Thumbnail{required && <span className={styles.required}> *</span>}
            </label>

            <div className={styles.uploadArea}>
                <input
                    {...registration}
                    type="file"
                    accept="image/*"
                    className={styles.hiddenInput}
                    ref={(element) => {
                        registration.ref(element);
                        fileInputRef.current = element;
                    }}
                    onChange={handleFileChange}
                    disabled={disabled}
                    required={required && !previewUrl}
                />

                {previewUrl ? (
                    <div className={styles.previewWrapper}>
                        <img
                            src={previewUrl}
                            alt="Event thumbnail preview"
                            className={styles.previewImage}
                        />
                        <div className={styles.actions}>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className={styles.removeBtn}
                                disabled={disabled}
                            >
                                Remove
                            </button>
                            <button
                                type="button"
                                onClick={triggerUpload}
                                className={styles.replaceBtn}
                                disabled={disabled}
                            >
                                Replace
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.iconPlaceholder}>
                            <i className="fas fa-image"></i>
                        </div>
                        <button
                            type="button"
                            onClick={triggerUpload}
                            className={styles.uploadBtn}
                            disabled={disabled}
                        >
                            Upload
                        </button>
                    </div>
                )}
            </div>

            {errors[name] && (
                <span className={styles.error}>
                    {errors[name]?.message as string}
                </span>
            )}
        </div>
    );
};
