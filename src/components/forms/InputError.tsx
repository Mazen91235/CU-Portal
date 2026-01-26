import styles from "./InputError.module.css";

export const InputError = ({ children }: { children: React.ReactNode }) => {
    return <span className={styles["input-error"]}>{children}</span>;
};
