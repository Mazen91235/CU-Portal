import { useState } from "react";
import clockIcon from "../../assets/icons/clock-icon.svg";
import locationIcon from "../../assets/icons/location-icon.svg";
import subjectIcon from "../../assets/icons/subject-icon.svg";
import timeIcon from "../../assets/icons/time-icon.svg";
import styles from "./Card.module.css";
import { Button } from "../forms/Button";

type CardItemColor = "green" | "yellow" | "orange" | "pink";

type CardItem = {
    icon: "clock" | "location" | "calendar" | "subject" | "person" | "time";
    label?: string;
    value?: string;
    color?: CardItemColor;
};

type CardProps = {
    title?: string;
    badge?: string;
    secondaryBadge?: string;
    items?: CardItem[];
    button?: string;
    buttonAction?: () => void;
    hasOptions?: boolean;
    editable?: boolean;
    viewable?: boolean;
    deletable?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
};

const getIconPath = (icon: string): string => {
    const iconMap: Record<string, string> = {
        clock: clockIcon,
        location: locationIcon,
        calendar: clockIcon,
        subject: subjectIcon,
        person: subjectIcon,
        time: timeIcon,
    };
    return iconMap[icon] || clockIcon;
};

const getColorClass = (color?: CardItemColor): string => {
    if (!color) return styles["item-default"];
    return styles[`item-${color}`];
};

export const Card = ({
    title,
    badge,
    secondaryBadge,
    items = [],
    button,
    buttonAction,
    hasOptions = false,
    editable = false,
    viewable = false,
    deletable = false,
    onEdit,
    onDelete,
    onView,
}: CardProps) => {
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);

    const handleOptionClick = (action?: () => void) => {
        setShowOptionsMenu(false);
        action?.();
    };

    return (
        <article className={styles.card}>
            {badge && (
                <div className={styles.badgeContainer}>
                    <span className={styles.badge}>{badge}</span>
                    {secondaryBadge && (
                        <span className={styles.secondaryBadge}>
                            {secondaryBadge}
                        </span>
                    )}
                </div>
            )}

            <div className={styles.titleRow}>
                <h3 className={styles.title}>{title}</h3>
                {hasOptions && (
                    <div className={styles.optionsContainer}>
                        <button
                            className={styles.optionsButton}
                            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                            aria-label="More options"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                            >
                                <circle cx="10" cy="4" r="1.5" fill="#666" />
                                <circle cx="10" cy="10" r="1.5" fill="#666" />
                                <circle cx="10" cy="16" r="1.5" fill="#666" />
                            </svg>
                        </button>
                        {showOptionsMenu && (
                            <div className={styles.optionsMenu}>
                                {viewable && (
                                    <button
                                        onClick={() =>
                                            handleOptionClick(onView)
                                        }
                                        className={styles.optionItem}
                                    >
                                        View
                                    </button>
                                )}
                                {editable && (
                                    <button
                                        onClick={() =>
                                            handleOptionClick(onEdit)
                                        }
                                        className={styles.optionItem}
                                    >
                                        Edit
                                    </button>
                                )}
                                {deletable && (
                                    <button
                                        onClick={() =>
                                            handleOptionClick(onDelete)
                                        }
                                        className={styles.optionItem}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {items.length > 0 && (
                <div className={styles.itemsContainer}>
                    {items.slice(0, 4).map((item, index) => (
                        <div
                            key={index}
                            className={`${styles.item} ${getColorClass(item.color)}`}
                        >
                            <span className={styles.itemLabel}>
                                <img
                                    src={getIconPath(item.icon)}
                                    alt={`${item.label} icon`}
                                    className={styles.itemIcon}
                                />
                                {item.label}
                            </span>
                            <span className={styles.itemValue}>
                                {item.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {button && buttonAction && (
                <div className={styles.buttonContainer}>
                    <Button
                        onClick={buttonAction}
                        text={button}
                        loadingText={"Loading..."}
                        isOrange={false}
                        isSubmitting={false}
                    />
                </div>
            )}
        </article>
    );
};
