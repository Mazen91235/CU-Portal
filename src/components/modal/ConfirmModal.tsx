import { useState } from "react";
import IconComponent from "../IconComponent";

import styles from "./ConfirmModal.module.css";

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    confirmText: string;
    title?: string;
    message?: string;
    colorType?: "orange" | "green" | "red";
    disabled?: boolean;
};

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    confirmText,
    title = "Are you sure?",
    message = "This action might affect other data.",
    colorType = "orange",
    disabled = false,
}: ConfirmModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isDisabled = disabled || isSubmitting;
    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (isDisabled) return;
        setIsSubmitting(true);
        try {
            await onConfirm();
        } finally {
            setIsSubmitting(false);
        }
    };

    const colorClass =
        colorType === "green"
            ? styles.green
            : colorType === "red"
              ? styles.red
              : styles.orange;

    return (
        <div className={styles.overlay} onClick={isDisabled ? undefined : onClose}>
            <div className={styles.box} onClick={(e) => e.stopPropagation()}>
                <div className={styles.content}>
                    <span className={styles.iconWrapper}>
                        <IconComponent
                            icon="warning-circle"
                            className={styles.icon}
                        />
                    </span>

                    <h2 className={styles.heading}>{title}</h2>
                    <p className={styles.message}>{message}</p>

                    <div className={styles.buttonRow}>
                        <button
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={isDisabled}
                        >
                            Cancel
                        </button>
                        <button
                            className={`${styles.confirmBtn} ${colorClass}`}
                            onClick={handleConfirm}
                            disabled={isDisabled}
                        >
                            {isSubmitting ? "Processing..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
