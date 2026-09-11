import { useEffect, useRef, useState } from "react";
import styles from "./MaterialActionsDropdown.module.css";

type MaterialActionsDropdownProps = {
    onShare?: () => void;
    onMove?: () => void;
    onCopy?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showAll?: boolean;
    showShare?: boolean;
    showCopy?: boolean;
    showMove?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
};

export const MaterialActionsDropdown = ({
    onShare,
    onMove,
    onCopy,
    onEdit,
    onDelete,
    showAll,
    showShare = true,
    showCopy = showAll ?? false,
    showMove = showAll ?? false,
    showEdit = showAll ?? false,
    showDelete = showAll ?? false,
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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [show]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShow(!show);
    };

    const handleAction = (action?: () => void) => {
        action?.();
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
            >
                <i className="fas fa-ellipsis-v"></i>
            </button>
            <div
                className={`${styles.dropdownMenu} ${show ? styles.show : ""}`}
            >
                {showShare && (
                    <a
                        href="#!"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(onShare);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="18"
                            height="18"
                            viewBox="0,0,256,256"
                        >
                            <g
                                fill="#7b1fa2"
                                fillRule="nonzero"
                                stroke="none"
                                strokeWidth="1"
                                strokeLinecap="butt"
                                strokeLinejoin="miter"
                                strokeMiterlimit="10"
                                strokeDasharray=""
                                strokeDashoffset="0"
                                fontFamily="none"
                                fontWeight="none"
                                fontSize="none"
                                style={{ mixBlendMode: "normal" }}
                            >
                                <g transform="scale(5.12,5.12)">
                                    <path d="M38,33c-2.43,0 -4.61,1.06 -6.13,2.73l-15.17,-8.42c0.2,-0.74 0.3,-1.51 0.3,-2.31c0,-0.8 -0.1,-1.57 -0.3,-2.31l15.17,-8.42c1.52,1.67 3.7,2.73 6.13,2.73c4.42,0 8,-3.58 8,-8c0,-4.42 -3.58,-8 -8,-8c-4.42,0 -8,3.58 -8,8c0,0.8 0.1,1.57 0.3,2.31l-15.17,8.42c-1.52,-1.67 -3.7,-2.73 -6.13,-2.73c-4.42,0 -8,3.58 -8,8c0,4.42 3.58,8 8,8c2.43,0 4.61,-1.06 6.13,-2.73l15.17,8.42c-0.2,0.74 -0.3,1.51 -0.3,2.31c0,4.42 3.58,8 8,8c4.42,0 8,-3.58 8,-8c0,-4.42 -3.58,-8 -8,-8z"></path>
                                </g>
                            </g>
                        </svg>
                    </a>
                )}
                {showMove && (
                    <a
                        href="#!"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(onMove);
                        }}
                    >
                        <svg
                            id="moveSvg"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-arrows-move"
                            viewBox="0 0 16 16"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10M.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8"
                            />
                        </svg>
                    </a>
                )}
                {showCopy && (
                    <a
                        href="#!"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(onCopy);
                        }}
                    >
                        <svg
                            id="copySvg"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-copy"
                            viewBox="0 0 16 16"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                            />
                        </svg>
                    </a>
                )}
                {showEdit && (
                    <a
                        href="#!"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(onEdit);
                        }}
                    >
                        <svg
                            id="editSvg"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-pencil-square"
                            viewBox="0 0 16 16"
                        >
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                            <path
                                fillRule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                            />
                        </svg>
                    </a>
                )}
                {showDelete && (
                    <a
                        href="#!"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(onDelete);
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            x="0px"
                            y="0px"
                            width="18"
                            height="18"
                            viewBox="0,0,256,256"
                        >
                            <g
                                fill="#ef4343"
                                fillRule="nonzero"
                                stroke="none"
                                strokeWidth="1"
                                strokeLinecap="butt"
                                strokeLinejoin="miter"
                                strokeMiterlimit="10"
                                strokeDasharray=""
                                strokeDashoffset="0"
                                fontFamily="none"
                                fontWeight="none"
                                fontSize="none"
                                style={{ mixBlendMode: "normal" }}
                            >
                                <g transform="scale(16,16)">
                                    <path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path>
                                </g>
                            </g>
                        </svg>
                    </a>
                )}
            </div>
        </div>
    );
};
