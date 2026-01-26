import styles from "./FormSplitter.module.css";

export const FormSplitter = ({ text }: { text: string }) => {
    return (
        <div className={styles["form-splitter"]}>
            <div className={styles["line"]} />
            <span>{text}</span>
            <div className={styles["line"]} />
        </div>
    );
};
