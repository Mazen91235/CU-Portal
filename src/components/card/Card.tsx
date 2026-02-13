import { useRef, useState } from "react";
import styles from "./Card.module.css";
import { Button } from "../forms/Button";
import { formatString } from "../../utils/Formatter";
import type { Icon } from "../../types/Icon";
import { GetIcon } from "../../utils/LinkHandler";

type CardItemColor = "green" | "yellow" | "orange" | "pink";

type CardItem = {
    icon: Icon;
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
    sharable?: boolean;
    deletable?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    onShare?: () => void;
};

const getColorClass = (color?: CardItemColor, index?: number): string => {
    if (!color) {
        const colors: CardItemColor[] = ["green", "yellow", "orange", "pink"];
        if (index == undefined) return styles[`item-default`];
        return styles[`item-${colors[index % colors.length]}`];
    }
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
    sharable = false,
    deletable = false,
    onEdit,
    onDelete,
    onView,
    onShare,
}: CardProps) => {
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);

    const optionsRef = useRef<HTMLDivElement>(null);

    const handleOptionClick = (action?: () => void) => {
        setShowOptionsMenu(false);
        action?.();
    };

    const handleClicks = (e: MouseEvent) => {
        if (
            e.target instanceof Node &&
            optionsRef.current &&
            !optionsRef.current.contains(e.target)
        ) {
            setShowOptionsMenu(false);
            document.removeEventListener("click", handleClicks);
        }
    };

    return (
        <article
            className={`${styles.card} ${showOptionsMenu ? styles.cardWithMenu : ""}`}
        >
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
                <h3 className={styles.title}>{formatString(title, 25)}</h3>
                {hasOptions && (
                    <div ref={optionsRef} className={styles.optionsContainer}>
                        <button
                            className={styles.optionsButton}
                            onClick={() => {
                                if (!showOptionsMenu)
                                    document.addEventListener(
                                        "click",
                                        handleClicks,
                                    );
                                else
                                    document.removeEventListener(
                                        "click",
                                        handleClicks,
                                    );
                                setShowOptionsMenu(!showOptionsMenu);
                            }}
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
                                {sharable && (
                                    <button
                                        onClick={() =>
                                            handleOptionClick(onShare)
                                        }
                                        className={styles.optionItem}
                                    >
                                        Share
                                    </button>
                                )}
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
                            className={`${styles.item} ${getColorClass(item.color, index)}`}
                        >
                            <span className={styles.itemLabel}>
                                <img
                                    src={GetIcon(item.icon)}
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
