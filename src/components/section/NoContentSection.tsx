import styles from "./NoContentSection.module.css";

export const NoContentSection = ({
    icon,
    label,
}: {
    icon: string;
    label: string;
}) => {
    return (
        <div className={styles.emptyState}>
            <i className={`fas fa-${icon}`}></i>
            <p>{label}</p>
        </div>
    );
};
