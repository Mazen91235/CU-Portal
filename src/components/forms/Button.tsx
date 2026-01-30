import styles from "./Button.module.css";

export const Button = ({
    text,
    loadingText,
    isSubmitting,
    type = "submit",
    onClick,
    isOrange = true,
    isSecondary = false,
}: {
    text: string;
    loadingText: string;
    isSubmitting: boolean;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    isOrange?: boolean;
    isSecondary?: boolean;
}) => {
    return (
        <button
            type={type}
            disabled={isSubmitting}
            className={`${styles["button"]} ${isSecondary ? styles["secondary"] : isOrange ? styles["orange"] : styles["purple"]}`}
            onClick={onClick}
        >
            {isSubmitting ? loadingText : text}
        </button>
    );
};
