import { GetIcon } from "../../utils/LinkHandler";

import styles from "./ConfirmModal.module.css";

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
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
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
    };

    const colorClass =
        colorType === "green"
            ? styles.green
            : colorType === "red"
              ? styles.red
              : styles.orange;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.box} onClick={(e) => e.stopPropagation()}>
                <div className={styles.content}>
                    <span className={styles.iconWrapper}>
                        <img
                            src={GetIcon("warning-circle")}
                            alt="Warning"
                            className={styles.icon}
                        />
                    </span>

                    <h2 className={styles.heading}>{title}</h2>
                    <p className={styles.message}>{message}</p>

                    <div className={styles.buttonRow}>
                        <button
                            className={styles.cancelBtn}
                            onClick={onClose}
                            disabled={disabled}
                        >
                            Cancel
                        </button>
                        <button
                            className={`${styles.confirmBtn} ${colorClass}`}
                            onClick={handleConfirm}
                            disabled={disabled}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
