import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type {
    FieldErrors,
    FieldValues,
    Path,
    PathValue,
    UseFormRegister,
    UseFormSetValue,
} from "react-hook-form";
import { GetDrivePreviewUrlFromUrl } from "../../utils/DriveManager";
import styles from "./Thumbnail.module.css";

type ThumbnailProps<T extends FieldValues> = {
    register: UseFormRegister<T>;
    name: Path<T>;
    errors: FieldErrors<T>;
    setValue: UseFormSetValue<T>;
    existingUrl?: string | null;
    onRemoveExisting?: () => void;
    disabled?: boolean;
    required?: boolean;
    label?: string;
    logo?: boolean;
};

export const Thumbnail = <T extends FieldValues>({
    register,
    name,
    errors,
    setValue,
    existingUrl,
    onRemoveExisting,
    disabled = false,
    required = false,
    label = "Thumbnail",
    logo = false,
}: ThumbnailProps<T>) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl || null);
    const [fileError, setFileError] = useState<string | null>(null);
    const hasPreviewRef = useRef(Boolean(existingUrl));
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const objectUrlRef = useRef<string | null>(null);
    const registration = register(name, {
        validate: (value) => {
            if (!required) return true;
            if (hasPreviewRef.current) return true;
            if ((value as unknown) instanceof File) return true;
            return Boolean(value && typeof value === "object" && "length" in value && Number(value.length) > 0) || `${label} is required`;
        },
    });

    useEffect(() => {
        const nextUrl = existingUrl || null;
        if (objectUrlRef.current) return;
        setPreviewUrl(nextUrl);
        hasPreviewRef.current = Boolean(nextUrl);
        setFileError(null);
    }, [existingUrl]);

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        };
    }, []);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFileError("Please select a valid image file.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setFileError(null);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = URL.createObjectURL(file);
        setPreviewUrl(objectUrlRef.current);
        hasPreviewRef.current = true;
        onRemoveExisting?.();
        setValue(name, file as unknown as PathValue<T, Path<T>>, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    const handleRemove = () => {
        if (disabled) return;
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }
        setPreviewUrl(null);
        hasPreviewRef.current = false;
        setFileError(null);
        setValue(name, undefined as PathValue<T, Path<T>>, {
            shouldValidate: true,
            shouldDirty: true,
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        onRemoveExisting?.();
    };

    const errorMessage =
        fileError || ((errors as Record<string, any>)[name]?.message as string | undefined);

    return (
        <div className={styles.thumbnailContainer}>
            <label className={styles.label}>
                {label}{required && <span className={styles.required}> *</span>}
            </label>
            <div className={`${styles.uploadArea} ${logo ? styles.logoUploadArea : ""}`}>
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
                />

                {previewUrl ? (
                    <div className={`${styles.previewWrapper} ${logo ? styles.logoPreviewWrapper : ""}`}>
                        <img
                            src={GetDrivePreviewUrlFromUrl(previewUrl) || previewUrl}
                            alt={`${label} preview`}
                            className={`${styles.previewImage} ${logo ? styles.logoPreviewImage : ""}`}
                        />
                        <div className={styles.actions}>
                            <button type="button" onClick={handleRemove} className={styles.removeBtn} disabled={disabled}>
                                Remove
                            </button>
                            <button type="button" onClick={() => !disabled && fileInputRef.current?.click()} className={styles.replaceBtn} disabled={disabled}>
                                Replace
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.iconPlaceholder}>
                            <i className="fas fa-image"></i>
                        </div>
                        <button type="button" onClick={() => !disabled && fileInputRef.current?.click()} className={styles.uploadBtn} disabled={disabled}>
                            Upload
                        </button>
                    </div>
                )}
            </div>
            {errorMessage && <span className={styles.error}>{errorMessage}</span>}
        </div>
    );
};
