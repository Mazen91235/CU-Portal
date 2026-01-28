import type { FieldErrors } from "react-hook-form";
import styles from "./FloatingForm.module.css";

type FloatingFormProps<T extends Record<string, unknown>> = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    errors: FieldErrors<T>;
    children: React.ReactNode;
    title?: string;
    onClose?: () => void;
    isOpen: boolean;
};

export const FloatingForm = <T extends Record<string, unknown>>({
    onSubmit,
    errors,
    children,
    title,
    onClose,
    isOpen,
}: FloatingFormProps<T>) => {
    if (!isOpen) return null;

    return (
        <div className={styles["overlay"]} onClick={onClose}>
            <div
                className={styles["modal"]}
                onClick={(e) => e.stopPropagation()}
            >
                {title && <h2 className={styles["title"]}>{title}</h2>}
                <form className={styles["form"]} onSubmit={onSubmit}>
                    {errors.root && (
                        <span className={styles["error"]}>
                            {errors.root?.message}
                        </span>
                    )}
                    {children}
                </form>
            </div>
        </div>
    );
};
