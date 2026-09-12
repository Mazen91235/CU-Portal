import { useState } from "react";
import { Button } from "../forms/Button";
import styles from "./MaterialForm.module.css";
import { showToast } from "../../utils/ToastsManager";

interface FetchFromDriveFormProps {
    onClose: () => void;
    onSubmit?: (url: string) => void | Promise<void>;
}

export function FetchFromDriveForm({
    onClose,
    onSubmit,
}: FetchFromDriveFormProps) {
    const [driveUrl, setDriveUrl] = useState("");
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
                await onSubmit(driveUrl.trim());
                onClose();
            } finally {
                setIsSubmitting(false);
            }
            return;
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={formDisabled ? undefined : onClose}>
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
                    <fieldset disabled={formDisabled} className={styles.fieldset}>
                    <div className={styles.formGroup}>
                        <label htmlFor="driveUrl" className={styles.label}>
                            Google Drive URL
                        </label>
                        <input
                            type="url"
                            id="driveUrl"
                            className={styles.input}
                            value={driveUrl}
                            onChange={(e) => setDriveUrl(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            required
                            autoFocus
                        />
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
