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
import { WeekItemsEditor } from "./WeekItemsEditor";
import type { WeekItemMutationDto } from "../../types/dtos/WeekItemDtos";
import type { FileDataWithExisting } from "../../types/entities/Attachment";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import { useAppDispatch } from "../../services/redux/Hooks";
import { setProcess } from "../../services/redux/reducers/ProcessReducer";
import type { Process } from "../../types/Process";
import styles from "./MaterialForm.module.css";

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
    const [weekItems, setWeekItems] = useState<WeekItemMutationDto[]>([]);
    const [shouldOverwrite, setShouldOverwrite] = useState(false);
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
            setWeekItems(
                (material.week_items || [])
                    .filter((item) => item.week?.id != null)
                    .map((item) => ({
                        week_id: item.week!.id!,
                        note: item.note?.trim() || undefined,
                    })),
            );
            setShouldOverwrite(false);
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
            setWeekItems([]);
            setShouldOverwrite(false);
        }
    }, [material]);

    useEffect(() => {
        let cancelled = false;

        const fetchWeeks = async () => {
            if (!departmentId || !yearId) {
                setWeeks([]);
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

                const availableWeeks = (response.data || []).filter(
                    (week) => week.id != null && week.week_number != null,
                );
                setWeeks(availableWeeks);
            } catch (error) {
                if (!cancelled) {
                    setWeeks([]);
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
    }, [departmentId, facultyId, getWeeks, yearId]);

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
            if (materialType !== "folder") {
                formData.append("week_items", JSON.stringify(weekItems));
            }
            if (parentId) {
                formData.append("parent_id", parentId.toString());
            }

            formData.append(
                "should_overwrite",
                String(materialType !== "folder" && shouldOverwrite),
            );

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
        setShouldOverwrite(false);
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

                        {materialType !== "folder" && (
                            <div className={styles.formGroup}>
                                <Select<Record<string, unknown>>
                                    name="should_overwrite"
                                    errors={{}}
                                    value={shouldOverwrite ? "true" : "false"}
                                    onChange={(e) =>
                                        setShouldOverwrite(
                                            e.target.value === "true",
                                        )
                                    }
                                    label="On Name Conflict?"
                                >
                                    <option value="false">Rename</option>
                                    <option value="true">Overwrite</option>
                                </Select>
                            </div>
                        )}

                        {materialType !== "folder" && (
                            <div className={styles.formGroup}>
                                <WeekItemsEditor
                                    value={weekItems}
                                    onChange={setWeekItems}
                                    availableWeeks={weeks}
                                    loading={weeksLoading}
                                    disabled={isLoading}
                                />
                            </div>
                        )}

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
                                <Input<Record<string, unknown>>
                                    name="link"
                                    type="url"
                                    errors={{}}
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    id="link"
                                    className={styles.input}
                                    label={
                                        materialType === "drive"
                                            ? "Google Drive Link"
                                            : materialType === "youtube"
                                              ? "YouTube Video Link"
                                              : "External Link"
                                    }
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
