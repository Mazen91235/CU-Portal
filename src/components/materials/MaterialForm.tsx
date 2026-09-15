import { useState, useRef, useEffect } from "react";
import { useLazyGetWeeksQuery } from "../../services/apis/admin/WeekAPIs";
import type { WeekResponseDto } from "../../types/dtos/WeekDtos";
import type { MaterialResponseDto } from "../../types/dtos/MaterialDtos";
import {
    useUploadFileToDriveChunked,
    useRemoveUploadedFiles,
} from "../../hooks/useHandleProcesses";
import { Button } from "../forms/Button";
import { Input } from "../forms/Input";
import { Select } from "../forms/Select";
import type { FileDataWithExisting } from "../../types/entities/Attachment";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import { formatDate, formatDateTime } from "../../utils/Formatter";
import { useAppDispatch } from "../../services/redux/Hooks";
import { setProcess } from "../../services/redux/reducers/ProcessReducer";
import type { Process } from "../../types/Process";
import styles from "./MaterialForm.module.css";

const getWeekEndDate = (startDate?: string | null) => {
    if (!startDate) return null;
    const date = new Date(formatDateTime(startDate, true));
    date.setUTCDate(date.getUTCDate() + 6);
    return date.toISOString().slice(0, 10);
};

interface MaterialFormProps {
    materialType: "folder" | "file" | "drive" | "youtube" | "external" | null;
    material: MaterialResponseDto | null;
    parentId: number | null;
    onClose: () => void;
    facultyId?: number | null;
    departmentId?: number | null;
    yearId?: number | null;
    onSubmit: (data: FormData, uploadResult?: Process) => Promise<void>;
}

export function MaterialForm({
    materialType: initialMaterialType,
    material,
    parentId,
    onClose,
    facultyId,
    departmentId,
    yearId,
    onSubmit,
}: MaterialFormProps) {
    const dispatch = useAppDispatch();
    const [name, setName] = useState(material?.name || "");
    const [weekId, setWeekId] = useState<number | "">(material?.week?.id ?? "");
    const [weeks, setWeeks] = useState<WeekResponseDto[]>([]);
    const [weeksLoading, setWeeksLoading] = useState(false);
    const [getWeeks] = useLazyGetWeeksQuery();
    const [materialType, setMaterialType] = useState<
        "folder" | "file" | "drive" | "youtube" | "external" | null
    >(initialMaterialType);
    const [link, setLink] = useState(material?.attachment?.url || "");
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [existingFileData, setExistingFileData] =
        useState<FileDataWithExisting | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadFile = useUploadFileToDriveChunked({});
    const removeUploadedFiles = useRemoveUploadedFiles();
    const formDisabled =
        isLoading || uploadFile.isGoogleAccessTokenLoading || weeksLoading;

    useEffect(() => {
        if (material) {
            setName(material.name || "");
            setMaterialType(
                material.material_type as
                    | "folder"
                    | "file"
                    | "drive"
                    | "youtube"
                    | "external",
            );
            setLink(material.attachment?.url || "");
            setWeekId(material.week?.id ?? "");
            if (material.material_type === "file" && material.attachment) {
                setExistingFileData({
                    id: material.attachment.details?.file_data?.id || "",
                    name: material.attachment.details?.file_data?.name || "",
                    mime_type:
                        material.attachment.details?.file_data?.mime_type || "",
                    url: material.attachment.url || "",
                });
            }
        } else {
            setWeekId("");
        }
    }, [material]);

    useEffect(() => {
        let cancelled = false;

        const fetchWeeks = async () => {
            if (!departmentId || !yearId) {
                setWeeks([]);
                setWeekId(material?.week?.id ?? "");
                return;
            }

            setWeeksLoading(true);
            try {
                const response = await getWeeks({
                    data: {
                        ...(facultyId ? { faculty_id: facultyId } : {}),
                        department_id: departmentId,
                        year_id: yearId,
                    },
                    order_by: ["week_number"],
                    limit: 1e6,
                }).unwrap();

                if (cancelled) return;

                const availableWeeks = (response.data || [])
                    .filter(
                        (week) => week.id != null && week.week_number != null,
                    )
                    .sort(
                        (a, b) => (a.week_number ?? 0) - (b.week_number ?? 0),
                    );
                setWeeks(availableWeeks);

                const currentWeekId = material?.week?.id;
                if (
                    currentWeekId &&
                    availableWeeks.some((week) => week.id === currentWeekId)
                ) {
                    setWeekId(currentWeekId);
                } else {
                    setWeekId("");
                }
            } catch (error) {
                if (!cancelled) {
                    setWeeks([]);
                    setWeekId(material?.week?.id ?? "");
                    handlePopupErrors(error);
                }
            } finally {
                if (!cancelled) setWeeksLoading(false);
            }
        };

        void fetchWeeks();

        return () => {
            cancelled = true;
        };
    }, [departmentId, facultyId, getWeeks, material?.week?.id, yearId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!name) {
                setName(e.target.files[0].name);
            }
            setExistingFileData(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const uploadedUrls: string[] = [];

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("material_type", materialType || "");
            // Folders are containers only and the API explicitly rejects week_id for them.
            // Files/links can be assigned to a weekly-guide week.
            if (materialType !== "folder" && weekId !== "") {
                formData.append("week_id", weekId.toString());
            }
            if (parentId) {
                formData.append("parent_id", parentId.toString());
            }

            if (material && material.id) {
                formData.append("id", material.id.toString());
            }
            if (materialType === "file") {
                if (file) {
                    const result = await uploadFile(file, name);
                    if (!result) return;
                    if (!result.url) {
                        dispatch(
                            setProcess({
                                ...result,
                                status: "failed",
                                reason: "Failed to upload file",
                            }),
                        );
                        return;
                    }
                    uploadedUrls.push(result.url);
                    formData.append("url", result.url);
                    await onSubmit(formData, result);
                    onClose();
                } else if (existingFileData) {
                    formData.append("url", existingFileData.url || "");
                    await onSubmit(formData);
                    onClose();
                }
            } else if (
                materialType === "drive" ||
                materialType === "youtube" ||
                materialType === "external"
            ) {
                formData.append("url", link);
                await onSubmit(formData);
                onClose();
            } else if (materialType === "folder") {
                await onSubmit(formData);
                onClose();
            }
        } catch (error) {
            await removeUploadedFiles(uploadedUrls);
            handlePopupErrors(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (
            materialType === "file" &&
            e.dataTransfer.files &&
            e.dataTransfer.files[0]
        ) {
            setFile(e.dataTransfer.files[0]);
            if (!name) {
                setName(e.dataTransfer.files[0].name);
            }
            setExistingFileData(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleTypeChange = (value: string) => {
        setMaterialType(
            value as "folder" | "file" | "drive" | "youtube" | "external",
        );
        if (value !== "file") {
            setFile(null);
            setExistingFileData(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } else {
            setLink("");
        }
        if (
            material &&
            material.material_type === value &&
            material.attachment?.url
        ) {
            setLink(material.attachment.url);
        }
        if (
            material &&
            material.material_type === "file" &&
            value === "file" &&
            material.attachment
        ) {
            setExistingFileData({
                id: material.attachment.details?.file_data?.id || "",
                name: material.attachment.details?.file_data?.name || "",
                mime_type:
                    material.attachment.details?.file_data?.mime_type || "",
                url: material.attachment.url || "",
            });
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setExistingFileData(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const getTitle = () => {
        if (material) {
            return `Edit ${materialType}`;
        }
        switch (materialType) {
            case "folder":
                return "Create New Folder";
            case "file":
                return "Upload File";
            case "drive":
                return "Add Google Drive Link";
            case "youtube":
                return "Add YouTube Video";
            case "external":
                return "Add External Link";
            default:
                return "Create Material";
        }
    };

    const typeOptions = [
        { value: "file", label: "File" },
        { value: "youtube", label: "Youtube Link" },
        { value: "drive", label: "Drive Link" },
        { value: "external", label: "External Link" },
    ];

    return (
        <div
            className={styles.modalOverlay}
            onClick={formDisabled ? undefined : onClose}
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{getTitle()}</h2>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={formDisabled}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <fieldset
                        disabled={formDisabled}
                        className={styles.fieldset}
                    >
                        <div className={styles.fileInputRow}>
                            <div className={styles.formGroup}>
                                <Input<Record<string, unknown>>
                                    name="name"
                                    type="text"
                                    errors={{}}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={styles.input}
                                    placeholder={
                                        materialType === "folder"
                                            ? "Enter folder name..."
                                            : "Enter material name..."
                                    }
                                    required
                                    label={
                                        materialType === "folder"
                                            ? "Folder Name"
                                            : "Material Name"
                                    }
                                />
                            </div>

                            {materialType !== "folder" && (
                                <div className={styles.fileTypeGroup}>
                                    <Select<Record<string, unknown>>
                                        name="material_type"
                                        errors={{}}
                                        value={materialType || "file"}
                                        onChange={(e) =>
                                            handleTypeChange(e.target.value)
                                        }
                                        label="Type"
                                    >
                                        {typeOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            {materialType !== "folder" && (
                                <>
                                    <Select<Record<string, unknown>>
                                        name="week_id"
                                        errors={{}}
                                        value={weekId}
                                        onChange={(e) =>
                                            setWeekId(
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : "",
                                            )
                                        }
                                        label="Week"
                                        disabled={
                                            weeksLoading || weeks.length === 0
                                        }
                                    >
                                        <option value="">
                                            {weeksLoading
                                                ? "Loading weeks..."
                                                : "No week"}
                                        </option>
                                        {weeks.map((week) => (
                                            <option
                                                key={week.id}
                                                value={week.id ?? ""}
                                            >
                                                {`Week ${week.week_number} (${formatDate(week.start_date, false)} - ${formatDate(getWeekEndDate(week.start_date), false)})`}
                                            </option>
                                        ))}
                                    </Select>
                                    {!weeksLoading && weeks.length === 0 && (
                                        <small
                                            style={{
                                                color: "var(--medium-grey)",
                                            }}
                                        >
                                            No weekly-guide weeks exist for this
                                            department and academic year.
                                        </small>
                                    )}
                                </>
                            )}
                        </div>

                        {materialType === "file" && (
                            <div className={styles.formGroup}>
                                <label className={styles.label}>File</label>
                                <div
                                    className={`${styles.fileUploadArea} ${isDragOver ? styles.dragover : ""}`}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onClick={() =>
                                        !file &&
                                        !existingFileData &&
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className={styles.fileInput}
                                        onChange={handleFileChange}
                                        required={
                                            !material &&
                                            !file &&
                                            !existingFileData
                                        }
                                    />
                                    {file || existingFileData ? (
                                        <div className={styles.fileList}>
                                            <div className={styles.fileItem}>
                                                <i className="far fa-file file-item-icon"></i>
                                                <span
                                                    className={
                                                        styles.fileItemName
                                                    }
                                                >
                                                    {file?.name ||
                                                        existingFileData?.name ||
                                                        ""}
                                                </span>
                                                <button
                                                    type="button"
                                                    className={
                                                        styles.fileItemRemove
                                                    }
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFile();
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.uploadContent}>
                                            <svg
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line
                                                    x1="12"
                                                    y1="3"
                                                    x2="12"
                                                    y2="15"
                                                />
                                            </svg>
                                            <p className={styles.uploadText}>
                                                Click to upload or drag and drop
                                            </p>
                                            <p className={styles.uploadSubtext}>
                                                Any file type (Max 100MB)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(materialType === "drive" ||
                            materialType === "youtube" ||
                            materialType === "external") && (
                            <div className={styles.formGroup}>
                                <label htmlFor="link" className={styles.label}>
                                    {materialType === "drive"
                                        ? "Google Drive Link"
                                        : materialType === "youtube"
                                          ? "YouTube Video Link"
                                          : "External Link"}
                                </label>
                                <input
                                    type="url"
                                    id="link"
                                    className={styles.input}
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder={
                                        materialType === "drive"
                                            ? "https://drive.google.com/..."
                                            : materialType === "youtube"
                                              ? "https://www.youtube.com/watch?v=..."
                                              : "https://example.com/..."
                                    }
                                    required
                                />
                            </div>
                        )}

                        <div className={styles.formActions}>
                            <Button
                                type="button"
                                isSubmitting={formDisabled}
                                text="Cancel"
                                loadingText="Canceling..."
                                className={styles.cancelButton}
                                isDefault={true}
                                onClick={onClose}
                            />
                            <Button
                                type="submit"
                                isSubmitting={formDisabled}
                                text={material ? "Update" : "Create"}
                                loadingText={
                                    material ? "Updating..." : "Creating..."
                                }
                                className={styles.submitButton}
                                isOrange={false}
                            />
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
