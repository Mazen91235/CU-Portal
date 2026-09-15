import { useRef, useState } from "react";
import { Button } from "../forms/Button";
import { formatString } from "../../utils/Formatter";
import type { Icon } from "../../types/Icon";
import IconComponent from "../IconComponent";
import { GetDrivePreviewUrlFromUrl } from "../../utils/DriveManager";
import styles from "./Card.module.css";

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
    img?: string;
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
    profile?: string;
    profileLogo?: string;
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
    img,
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
    profile,
    profileLogo,
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
            {img && (
                <div
                    className={styles.imageContainer}
                    style={{
                        backgroundImage: `url(${GetDrivePreviewUrlFromUrl(img) || img})`,
                    }}
                ></div>
            )}

            {badge && (
                <div
                    className={styles.badgeContainer}
                    style={img ? { position: "absolute", margin: "1rem" } : {}}
                >
                    <span className={styles.badge}>{badge}</span>
                    {secondaryBadge && (
                        <span className={styles.secondaryBadge}>
                            {secondaryBadge}
                        </span>
                    )}
                </div>
            )}

            {img && <h3 className={styles.title}>{formatString(title, "CardTitle")}</h3>}

            <div
                className={styles.titleRow}
                style={img ? { position: "absolute", margin: "1rem" } : {}}
            >
                {!img && (
                    <h3 className={styles.title}>{formatString(title, "CardTitle")}</h3>
                )}
                {hasOptions && (
                    <div ref={optionsRef} className={styles.optionsContainer}>
                        <button
                            className={styles.optionsButton}
                            style={img ? { opacity: 1 } : {}}
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
                                <circle
                                    cx="10"
                                    cy="4"
                                    r="1.5"
                                    fill={img ? "white" : "#666"}
                                />
                                <circle
                                    cx="10"
                                    cy="10"
                                    r="1.5"
                                    fill={img ? "white" : "#666"}
                                />
                                <circle
                                    cx="10"
                                    cy="16"
                                    r="1.5"
                                    fill={img ? "white" : "#666"}
                                />
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

            {profile && (
                <div className={styles.profileContainer}>
                    {profileLogo ? (
                        <div>
                            <img
                                className={styles.profileIcon}
                                src={
                                    GetDrivePreviewUrlFromUrl(profileLogo) ||
                                    profileLogo
                                }
                                alt="Profile logo"
                            />
                        </div>
                    ) : (
                        <div className={styles.profileIcon}>
                            {profile.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                    <span className={styles.profileText}>{profile}</span>
                </div>
            )}

            {items.length > 0 && (
                <div className={styles.itemsContainer}>
                    {items.slice(0, 4).map((item, index) => (
                        <div
                            key={index}
                            className={`${styles.item} ${getColorClass(item.color, index)}`}
                        >
                            <span className={styles.itemLabel}>
                                <IconComponent
                                    icon={item.icon}
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
