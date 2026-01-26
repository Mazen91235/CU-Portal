import styles from "./Splitter.module.css";
export const Splitter = ({ children }: { children: React.ReactNode }) => {
    return <div className={`col-12 ${styles["splitter"]}`}>{children}</div>;
};
