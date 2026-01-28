import styles from "./Button.module.css";

export const Button = ({
    text,
    loadingText,
    isSubmitting,
    type = "submit",
    onClick,
    isOrange = true,
}: {
    text: string;
    loadingText: string;
    isSubmitting: boolean;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    isOrange?: boolean;
}) => {
    return (
        <button
            type={type}
            disabled={isSubmitting}
            className={styles["button"]}
            onClick={onClick}
            style={{
                background: isOrange
                    ? "var(--primary-orange)"
                    : "var(--primary-purple)",
            }}
        >
            {isSubmitting ? loadingText : text}
        </button>
    );
};
