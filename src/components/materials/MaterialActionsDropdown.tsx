import { useEffect, useRef, useState } from "react";
import type { MaterialActionsDropdownProps } from "./types";
import IconComponent from "../IconComponent";
import styles from "./MaterialActionsDropdown.module.css";

export type { MaterialActionsDropdownProps } from "./types";

export const MaterialActionsDropdown = ({
    onShare,
    onDownload,
    onMove,
    onCopy,
    onEdit,
    onDelete,
    showAll = true,
}: MaterialActionsDropdownProps) => {
    const [show, setShow] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!show) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShow(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [show]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShow((value) => !value);
    };

    const handleAction = (action: () => void) => {
        action();
        setShow(false);
    };

    return (
        <div
            className={styles.dropdown}
            onMouseDown={(e) => e.stopPropagation()}
            ref={dropdownRef}
        >
            <button
                className={`${styles.dropbtn} ${show ? styles.show : ""}`}
                type="button"
                onClick={handleToggle}
                aria-label="Material actions"
            >
                <i className="fas fa-ellipsis-v"></i>
            </button>
            <div
                className={`${styles.dropdownMenu} ${show ? styles.show : ""}`}
            >
                <a
                    href="#!"
                    title="Share"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction(onShare);
                    }}
                >
                    <IconComponent icon="share" />
                </a>
                {onDownload && (
                    <a
                        href="#!"
                        title="Download"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(onDownload);
                        }}
                    >
                        <IconComponent icon="download" />
                    </a>
                )}
                {showAll && (
                    <>
                        <a
                            href="#!"
                            title="Copy"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAction(onCopy);
                            }}
                        >
                            <IconComponent icon="copy" />
                        </a>
                        <a
                            href="#!"
                            title="Move"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAction(onMove);
                            }}
                        >
                            <IconComponent icon="move" />
                        </a>
                        <a
                            href="#!"
                            title="Edit"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAction(onEdit);
                            }}
                        >
                            <IconComponent icon="edit" />
                        </a>
                        <a
                            href="#!"
                            title="Delete"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAction(onDelete);
                            }}
                        >
                            <IconComponent icon="delete" />
                        </a>
                    </>
                )}
            </div>
        </div>
    );
};
