import styles from "./Button.module.css";

export const Button = ({
    text,
    loadingText,
    isSubmitting,
    isOrange = true,
    variant,
    type = "submit",
    onClick,
    children,
}: {
    text?: string;
    loadingText?: string;
    isSubmitting?: boolean;
    isOrange?: boolean;
    variant?: "primary" | "remove" | "google";
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    children?: React.ReactNode;
}) => {
    const getClassName = () => {
        if (variant === "remove") return styles["button-remove"];
        if (variant === "google") return styles["button-google"];
        return styles["button"];
    };

    const getStyle = () => {
        if (variant) return undefined;
        return {
            background: isOrange
                ? "var(--primary-orange)"
                : "var(--primary-purple)",
        };
    };

    return (
        <button
            type={type}
            disabled={isSubmitting}
            className={getClassName()}
            style={getStyle()}
            onClick={onClick}
        >
            {children || (isSubmitting ? loadingText : text)}
        </button>
    );
};
