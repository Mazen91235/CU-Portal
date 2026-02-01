import styles from "./Bordered.module.css";

type BorderedProps = {
    children: React.ReactNode;
};

export const Bordered = ({ children }: BorderedProps) => {
    return <div className={styles.bordered}>{children}</div>;
};
