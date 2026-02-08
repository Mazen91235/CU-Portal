import styles from "./Button.module.css";

export const Button = ({
    text,
    loadingText,
    isSubmitting,
    type = "submit",
    onClick,
    isOrange = true,
    isSecondary = false,
    isDefault = false,
    className = "",
}: {
    text: string;
    loadingText: string;
    isSubmitting: boolean;
    type?: "button" | "submit" | "reset" | "default";
    onClick?: () => void;
    isOrange?: boolean;
    isSecondary?: boolean;
    isDefault?: boolean;
    className?: string;
}) => {
    const buttonType = type === "default" ? "button" : type;
    const getButtonClass = () => {
        if (isDefault || type === "default") return styles["default"];
        if (isSecondary) return styles["secondary"];
        if (isOrange) return styles["orange"];
        return styles["purple"];
    };

    return (
        <button
            type={buttonType}
            disabled={isSubmitting}
            className={`${styles["button"]} ${getButtonClass()} ${className}`}
            onClick={onClick}
        >
            {isSubmitting ? loadingText : text}
        </button>
    );
};
