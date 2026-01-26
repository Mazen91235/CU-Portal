import { Link } from "react-router";
import styles from "./FormLink.module.css";
export const FormLink = ({
    to,
    text,
    subText,
}: {
    to: string;
    text: string;
    subText?: string;
}) => {
    return (
        <div
            className={
                subText
                    ? `${styles["form-link"]} ${styles["with-subtext"]}`
                    : styles["form-link"]
            }
        >
            {subText && <span>{subText} </span>}
            <Link to={to}>{text}</Link>
        </div>
    );
};
