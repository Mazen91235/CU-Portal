import { formatString } from "../../utils/Formatter";
import styles from "./BrowseCard.module.css";

type BrowseCardProps = {
    title?: string | null;
    onClick: () => void;
};

export const BrowseCard = ({ title, onClick }: BrowseCardProps) => {
    return (
        <button type="button" className={styles.card} onClick={onClick}>
            <span className={styles.title}>{formatString(title, 30)}</span>
        </button>
    );
};

export default BrowseCard;
