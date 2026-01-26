import type { FieldErrors } from "react-hook-form";
import styles from "./Form.module.css";

type FormProps<T extends Record<string, unknown>> = {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    errors: FieldErrors<T>;
    children: React.ReactNode;
};

export const Form = <T extends Record<string, unknown>>({
    onSubmit,
    errors,
    children,
}: FormProps<T>) => {
    return (
        <div className={`col-12 ${styles["form-container"]}`}>
            <form className={styles["form"]} onSubmit={onSubmit}>
                {errors.root && (
                    <span className={styles["error"]}>
                        {errors.root?.message}
                    </span>
                )}
                {children}
            </form>
        </div>
    );
};
