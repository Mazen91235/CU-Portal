import { useRef, useState } from "react";
import type { Material } from "../../types/entities/Material";
import { getFileIcon } from "../../utils/MaterialHelpers";
import { formatTimeAgo } from "../../utils/Formatter";
import { MaterialActionsDropdown } from "./MaterialActionsDropdown";
import styles from "./MaterialCard.module.css";

type MaterialCardProps = {
    material: Material;
    isSelected: boolean;
    onClick: (materialId: number) => void;
    onDoubleClick: (materialId: number) => void;
    onDragStart: (materialId: number) => void;
    onDrop?: (targetId: number | null) => void;
    onEdit: (materialId: number) => void;
    onDelete: (materialId: number) => void;
    onCopy: (materialId: number) => void;
    onMove: (materialId: number) => void;
    onPreview?: (
        fileId: string,
        fileName: string,
        realFileName: string,
        mimeType: string,
    ) => void;
    onDownload?: (fileId: string, fileName: string) => void;
    onOpenLink?: (url: string) => void;
    className?: string;
};

export const MaterialCard = ({
    material,
    isSelected,
    onClick,
    onDoubleClick,
    onDragStart,
    onEdit,
    onDelete,
    onCopy,
    onMove,
    onPreview,
    onDownload,
    onOpenLink,
    onDrop,
    className = "",
}: MaterialCardProps) => {
    const [clickCount, setClickCount] = useState(0);
    const clickTimeoutRef = useRef<number | null>(null);
    const initialPositionRef = useRef({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const isFolder = material.type?.toLowerCase() === "folder";
    const isFile = material.type?.toLowerCase() === "file";

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        if ((e.target as HTMLElement).closest(".dropdown")) return;
        if ((e.target as HTMLElement).closest(`.${styles.fileActionBtn}`))
            return;

        initialPositionRef.current = { x: e.clientX, y: e.clientY };
        setIsDragging(false);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const moveX = Math.abs(
                moveEvent.clientX - initialPositionRef.current.x,
            );
            const moveY = Math.abs(
                moveEvent.clientY - initialPositionRef.current.y,
            );

            if (moveX > 10 || moveY > 10) {
                setIsDragging(true);
                if (material.id) {
                    onClick(material.id);
                    onDragStart(material.id);
                }
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            if (isDragging) {
                setClickCount(0);
                if (clickTimeoutRef.current)
                    clearTimeout(clickTimeoutRef.current);
                return;
            }

            if (isFolder && clickCount > 0) {
                setClickCount(0);
                if (clickTimeoutRef.current)
                    clearTimeout(clickTimeoutRef.current);
                if (material.id) onDoubleClick(material.id);
                return;
            }

            if (isFolder) {
                setClickCount((prev) => prev + 1);
                clickTimeoutRef.current = setTimeout(() => {
                    setClickCount(0);
                    if (material.id) onClick(material.id);
                }, 300);
            } else {
                setTimeout(() => {
                    if (material.id) onClick(material.id);
                }, 300);
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Dropped on material", material.id);
        if (onDrop) {
            onDrop(material.id || null);
        }
    };

    const handleEdit = () => {
        if (material.id) onEdit(material.id);
    };

    const handleDelete = () => {
        if (material.id) onDelete(material.id);
    };

    const handleCopy = () => {
        if (material.id) {
            onClick(material.id);
            onCopy(material.id);
        }
    };

    const handleMove = () => {
        if (material.id) {
            onClick(material.id);
            onMove(material.id);
        }
    };

    const handleSelect = () => {
        if (material.id) onClick(material.id);
    };

    const handlePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (material.details?.file_data?.id && onPreview) {
            onPreview(
                material.details.file_data.id,
                material.name || "",
                material.details.file_data.name || "",
                material.details.file_data.mimeType || "",
            );
        }
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (material.details?.file_data?.id && onDownload) {
            const downloadName =
                material.name || material.details.file_data.name || "download";
            onDownload(material.details.file_data.id, downloadName);
        }
    };

    const handleOpenLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (material.url && onOpenLink) {
            onOpenLink(material.url);
        }
    };

    const truncateName = (name: string, maxLength = 30) => {
        if (name.length <= maxLength) return name;
        return `${name.substring(0, 25)}...${name.substring(name.length - 5)}`;
    };

    if (isFolder) {
        return (
            <div
                className={`${styles.folderCard} ${isSelected ? styles.selected : ""} ${isDragOver ? styles.dragOver : ""} ${className}`}
                data-id={material.id}
                onMouseDown={handleMouseDown}
                onMouseEnter={() => {
                    if (isDragging) {
                        setIsDragOver(true);
                    }
                }}
                onMouseLeave={() => {
                    setIsDragOver(false);
                }}
                onDrop={handleDrop}
            >
                <span className={styles.materialSelectedIcon}>
                    <svg
                        width="24"
                        height="25"
                        viewBox="0 0 24 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            y="0.400391"
                            width="23.4839"
                            height="24"
                            rx="11.7419"
                            fill="#5A0F61"
                        />
                        <rect
                            x="6.5"
                            y="6.90039"
                            width="11"
                            height="11"
                            rx="5.5"
                            stroke="white"
                        />
                        <path
                            d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z"
                            fill="white"
                        />
                    </svg>
                </span>
                <div className={styles.folderHeader}>
                    <MaterialActionsDropdown
                        onSelect={handleSelect}
                        onMove={handleMove}
                        onCopy={handleCopy}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
                <div className={styles.folderContent}>
                    <div className={styles.svg}>
                        <svg
                            width="105"
                            height="88"
                            viewBox="0 0 105 88"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g filter="url(#filter0_dd_1720_6769)">
                                <rect
                                    x="12.5"
                                    y="2"
                                    width="80"
                                    height="64"
                                    rx="12"
                                    fill="url(#paint0_linear_1720_6769)"
                                />
                                <path
                                    d="M65.834 47.3333C66.718 47.3333 67.5659 46.9821 68.191 46.357C68.8161 45.7319 69.1673 44.8841 69.1673 44V27.3333C69.1673 26.4493 68.8161 25.6014 68.191 24.9763C67.5659 24.3512 66.718 24 65.834 24H52.6673C52.1098 24.0055 51.5599 23.871 51.0678 23.609C50.5757 23.3469 50.1573 22.9656 49.8507 22.5L48.5007 20.5C48.1971 20.0391 47.7839 19.6608 47.2981 19.399C46.8124 19.1372 46.2692 19.0001 45.7173 19H39.1673C38.2833 19 37.4354 19.3512 36.8103 19.9763C36.1852 20.6014 35.834 21.4493 35.834 22.3333V44C35.834 44.8841 36.1852 45.7319 36.8103 46.357C37.4354 46.9821 38.2833 47.3333 39.1673 47.3333H65.834Z"
                                    stroke="white"
                                    strokeWidth="3.33333"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </g>
                            <defs>
                                <filter
                                    id="filter0_dd_1720_6769"
                                    x="0.5"
                                    y="0"
                                    width="104"
                                    height="88"
                                    filterUnits="userSpaceOnUse"
                                    colorInterpolationFilters="sRGB"
                                >
                                    <feFlood
                                        floodOpacity="0"
                                        result="BackgroundImageFix"
                                    />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        type="matrix"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feMorphology
                                        radius="4"
                                        operator="erode"
                                        in="SourceAlpha"
                                        result="effect1_dropShadow_1720_6769"
                                    />
                                    <feOffset dy="4" />
                                    <feGaussianBlur stdDeviation="3" />
                                    <feComposite
                                        in2="hardAlpha"
                                        operator="out"
                                    />
                                    <feColorMatrix
                                        type="matrix"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                                    />
                                    <feBlend
                                        mode="normal"
                                        in2="BackgroundImageFix"
                                        result="effect1_dropShadow_1720_6769"
                                    />
                                    <feColorMatrix
                                        in="SourceAlpha"
                                        type="matrix"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                        result="hardAlpha"
                                    />
                                    <feMorphology
                                        radius="3"
                                        operator="erode"
                                        in="SourceAlpha"
                                        result="effect2_dropShadow_1720_6769"
                                    />
                                    <feOffset dy="10" />
                                    <feGaussianBlur stdDeviation="7.5" />
                                    <feComposite
                                        in2="hardAlpha"
                                        operator="out"
                                    />
                                    <feColorMatrix
                                        type="matrix"
                                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                                    />
                                    <feBlend
                                        mode="normal"
                                        in2="effect1_dropShadow_1720_6769"
                                        result="effect2_dropShadow_1720_6769"
                                    />
                                    <feBlend
                                        mode="normal"
                                        in="SourceGraphic"
                                        in2="effect2_dropShadow_1720_6769"
                                        result="shape"
                                    />
                                </filter>
                                <linearGradient
                                    id="paint0_linear_1720_6769"
                                    x1="16.5"
                                    y1="-2"
                                    x2="88.5"
                                    y2="70"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#5A0F61" />
                                    <stop offset="1" stopColor="#7B1684" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className={styles.folderInfo}>
                        <span className={styles.folderName}>
                            {truncateName(material.name || "")}
                        </span>
                        <span className={styles.folderTag}>
                            {material.subject?.code}
                        </span>
                        <span className={styles.folderDate}>
                            {formatTimeAgo(material.modified_at || "")}
                        </span>
                    </div>
                    <div className={styles.folderStats}>
                        <span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 50 50"
                            >
                                <path d="M 3 4 C 1.355469 4 0 5.355469 0 7 L 0 43.90625 C -0.0625 44.136719 -0.0390625 44.378906 0.0625 44.59375 C 0.34375 45.957031 1.5625 47 3 47 L 42 47 C 43.492188 47 44.71875 45.875 44.9375 44.4375 C 44.945313 44.375 44.964844 44.3125 44.96875 44.25 C 44.96875 44.230469 44.96875 44.207031 44.96875 44.1875 L 45 44.03125 C 45 44.019531 45 44.011719 45 44 L 49.96875 17.1875 L 50 17.09375 L 50 17 C 50 15.355469 48.644531 14 47 14 L 47 11 C 47 9.355469 45.644531 8 44 8 L 18.03125 8 C 18.035156 8.003906 18.023438 8 18 8 C 17.96875 7.976563 17.878906 7.902344 17.71875 7.71875 C 17.472656 7.4375 17.1875 6.96875 16.875 6.46875 C 16.5625 5.96875 16.226563 5.4375 15.8125 4.96875 C 15.398438 4.5 14.820313 4 14 4 Z M 3 6 L 14 6 C 13.9375 6 14.066406 6 14.3125 6.28125 C 14.558594 6.5625 14.84375 7.03125 15.15625 7.53125 C 15.46875 8.03125 15.8125 8.5625 16.21875 9.03125 C 16.625 9.5 17.179688 10 18 10 L 44 10 C 44.5625 10 45 10.4375 45 11 L 45 14 L 8 14 C 6.425781 14 5.171875 15.265625 5.0625 16.8125 L 5.03125 16.8125 L 5 17 L 2 33.1875 L 2 7 C 2 6.4375 2.4375 6 3 6 Z M 8 16 L 47 16 C 47.5625 16 48 16.4375 48 17 L 43.09375 43.53125 L 43.0625 43.59375 C 43.050781 43.632813 43.039063 43.675781 43.03125 43.71875 C 43.019531 43.757813 43.007813 43.800781 43 43.84375 C 43 43.863281 43 43.886719 43 43.90625 C 43 43.917969 43 43.925781 43 43.9375 C 42.984375 43.988281 42.976563 44.039063 42.96875 44.09375 C 42.964844 44.125 42.972656 44.15625 42.96875 44.1875 C 42.964844 44.230469 42.964844 44.269531 42.96875 44.3125 C 42.84375 44.71875 42.457031 45 42 45 L 3 45 C 2.4375 45 2 44.5625 2 44 L 6.96875 17.1875 L 7 17.09375 L 7 17 C 7 16.4375 7.4375 16 8 16 Z"></path>
                            </svg>
                            {material.details?.folders_count ?? 0}
                        </span>
                        <span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 50 50"
                            >
                                <path d="M 7 2 L 7 48 L 43 48 L 43 14.59375 L 42.71875 14.28125 L 30.71875 2.28125 L 30.40625 2 Z M 9 4 L 29 4 L 29 16 L 41 16 L 41 46 L 9 46 Z M 31 5.4375 L 39.5625 14 L 31 14 Z M 15 22 L 15 24 L 35 24 L 35 22 Z M 15 28 L 15 30 L 31 30 L 31 28 Z M 15 34 L 15 36 L 35 36 L 35 34 Z"></path>
                            </svg>
                            {material.details?.files_count ?? 0}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${styles.fileCard} ${isSelected ? styles.selected : ""} ${className}`}
            data-id={material.id}
            onMouseDown={handleMouseDown}
        >
            <span className={styles.materialSelectedIcon}>
                <svg
                    width="24"
                    height="25"
                    viewBox="0 0 24 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect
                        y="0.400391"
                        width="23.4839"
                        height="24"
                        rx="11.7419"
                        fill="#5A0F61"
                    />
                    <rect
                        x="6.5"
                        y="6.90039"
                        width="11"
                        height="11"
                        rx="5.5"
                        stroke="white"
                    />
                    <path
                        d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z"
                        fill="white"
                    />
                </svg>
            </span>
            <div className={styles.fileHeader}>
                <MaterialActionsDropdown
                    onSelect={handleSelect}
                    onMove={handleMove}
                    onCopy={handleCopy}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>
            <div className={styles.fileContent}>
                <div className={styles.fileIcon}>
                    <img
                        src={getFileIcon(
                            material.details?.file_data?.type || material.type,
                        )}
                        alt="File Icon"
                    />
                </div>
                <div className={styles.fileInfo}>
                    <div className={styles.fileName}>
                        {truncateName(material.name || "")}
                    </div>
                    <span className={styles.fileTag}>
                        {material.subject?.code}
                    </span>
                    <div className={styles.fileDate}>
                        {formatTimeAgo(material.modified_at || "")}
                    </div>
                </div>
            </div>
            <div className={styles.fileActions}>
                {isFile && (
                    <>
                        <button
                            className={styles.fileActionBtn}
                            onClick={handlePreview}
                        >
                            <i className="fas fa-eye"></i> Preview
                        </button>
                        <button
                            className={styles.fileActionBtn}
                            onClick={handleDownload}
                        >
                            <i className="fas fa-download"></i> Download
                        </button>
                    </>
                )}
                {(material.type === "drive" ||
                    material.type === "youtube" ||
                    material.type === "external") && (
                    <button
                        className={styles.fileActionBtn}
                        onClick={handleOpenLink}
                    >
                        <i className="fas fa-external-link"></i> Open
                    </button>
                )}
            </div>
        </div>
    );
};

export default MaterialCard;
