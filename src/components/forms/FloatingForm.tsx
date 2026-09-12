import type { FieldErrors } from "react-hook-form";
import styles from "./FloatingForm.module.css";

type FloatingFormProps<T extends Record<string, unknown>> = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    errors: FieldErrors<T>;
    children: React.ReactNode;
    title?: string;
    onClose?: () => void;
    isOpen: boolean;
    className?: string;
    disabled?: boolean;
};

export const FloatingForm = <T extends Record<string, unknown>>({
    onSubmit,
    errors,
    children,
    title,
    onClose,
    isOpen,
    className,
    disabled = false,
}: FloatingFormProps<T>) => {
    if (!isOpen) return null;

    return (
        <div className={styles["overlay"]} onClick={disabled ? undefined : onClose}>
            <div
                className={`${styles["modal"]} ${className || ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && <h2 className={styles["title"]}>{title}</h2>}
                <form className={styles["form"]} onSubmit={onSubmit}>
                    {errors.root && (
                        <span className={styles["error"]}>
                            {errors.root?.message}
                        </span>
                    )}
                    <fieldset disabled={disabled} className={styles["fieldset"]}>
                        {children}
                    </fieldset>
                </form>
            </div>
        </div>
    );
};
