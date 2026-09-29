import { useState } from "react";
import { Button } from "../forms/Button";
import { Input } from "../forms/Input";
import { Select } from "../forms/Select";
import styles from "./MaterialForm.module.css";
import { showToast } from "../../utils/ToastsManager";

interface FetchFromDriveFormProps {
    onClose: () => void;
    onSubmit?: (url: string, shouldOverwrite: boolean) => void | Promise<void>;
}

export function FetchFromDriveForm({
    onClose,
    onSubmit,
}: FetchFromDriveFormProps) {
    const [driveUrl, setDriveUrl] = useState("");
    const [shouldOverwrite, setShouldOverwrite] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formDisabled = isSubmitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formDisabled) return;

        if (!driveUrl.trim()) {
            showToast("error", "Error", "Please enter a Google Drive URL");
            return;
        }

        if (onSubmit) {
            setIsSubmitting(true);
            try {
                await onSubmit(driveUrl.trim(), shouldOverwrite);
                onClose();
            } finally {
                setIsSubmitting(false);
            }
            return;
        }
    };

    return (
        <div
            className={styles.modalOverlay}
            onClick={formDisabled ? undefined : onClose}
        >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Fetch From Drive</h2>
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
                        <div className={styles.formGroup}>
                            <Input<Record<string, unknown>>
                                name="driveUrl"
                                type="url"
                                errors={{}}
                                value={driveUrl}
                                onChange={(e) => setDriveUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                required
                                label="Google Drive URL"
                                id="driveUrl"
                                className={styles.input}
                            />
                        </div>

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
                                text="Fetch Files"
                                loadingText="Fetching..."
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
