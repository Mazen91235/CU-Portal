import warningIcon from "../../assets/icons/warning-circle.svg";

import styles from "./ConfirmModal.module.css";

type ConfirmModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    confirmText: string;
    title?: string;
    message?: string;
};

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    confirmText,
    title = "Are you sure?",
    message = "This action might affect other data.",
}: ConfirmModalProps) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.box} onClick={(e) => e.stopPropagation()}>
                <div className={styles.content}>
                    <span className={styles.iconWrapper}>
                        <img
                            src={warningIcon}
                            alt="Warning"
                            className={styles.icon}
                        />
                    </span>

                    <h2 className={styles.heading}>{title}</h2>
                    <p className={styles.message}>{message}</p>

                    <div className={styles.buttonRow}>
                        <button className={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            className={styles.confirmBtn}
                            onClick={handleConfirm}
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
