import type { FieldErrors } from "react-hook-form";
import styles from "./Form.module.css";

type FormProps<T extends Record<string, unknown>> = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    errors: FieldErrors<T>;
    className?: string;
    containerClassName?: string;
    children: React.ReactNode;
    disabled?: boolean;
};

export const Form = <T extends Record<string, unknown>>({
    onSubmit,
    errors,
    className,
    containerClassName,
    children,
    disabled = false,
}: FormProps<T>) => {
    return (
        <div className={`col-12 ${styles["form-container"]} ${containerClassName || ""}`}>
            <form className={`${styles["form"]} ${className || ""}`} onSubmit={onSubmit}>
                {errors.root && <span className={styles["error"]}>{errors.root?.message}</span>}
                <fieldset className={styles.fieldset} disabled={disabled}>
                    {children}
                </fieldset>
            </form>
        </div>
    );
};
