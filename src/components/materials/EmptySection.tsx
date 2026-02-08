import styles from "./EmptySection.module.css";

type EmptySectionProps = {
    text: string;
    img: string;
    subtitle?: string;
};

export const EmptySection = ({ text, img, subtitle }: EmptySectionProps) => {
    return (
        <div className={styles.emptySection}>
            <img src={img} alt={text} className={styles.image} />
            <div className={styles.title}>{text}</div>
            {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
    );
};

export default EmptySection;
