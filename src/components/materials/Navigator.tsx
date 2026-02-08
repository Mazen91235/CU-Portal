import { useState } from "react";
import type { Material } from "../../types/entities/Material";
import styles from "./Navigator.module.css";

interface NavigatorProps {
    path: Material[];
    onNavigate: (material: Material | null) => void;
    onDrop?: (targetId: number | null) => void;
    isDraggingGlobal?: boolean;
}

export function Navigator({
    path,
    onNavigate,
    onDrop,
    isDraggingGlobal = false,
}: NavigatorProps) {
    const [dragOverId, setDragOverId] = useState<number | null | "home">(null);

    const handleMouseEnter = (id: number | null | "home") => {
        if (isDraggingGlobal) {
            setDragOverId(id);
        }
    };

    const handleMouseLeave = () => {
        setDragOverId(null);
    };

    const handleMouseUp = (targetId: number | null) => {
        if (isDraggingGlobal && onDrop) {
            onDrop(targetId);
        }
        setDragOverId(null);
    };

    return (
        <div className={styles.navigator}>
            <div className={styles.breadcrumb}>
                <button
                    className={`${styles.breadcrumbItem} ${dragOverId === "home" ? styles.dragOver : ""}`}
                    onClick={() => onNavigate(null)}
                    onMouseEnter={() => handleMouseEnter("home")}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={() => handleMouseUp(null)}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Home
                </button>

                {path.map((folder, index) => (
                    <div key={folder.id} className={styles.breadcrumbSegment}>
                        <svg
                            className={styles.separator}
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <button
                            className={`${styles.breadcrumbItem} ${index === path.length - 1 ? styles.active : ""} ${dragOverId === folder.id ? styles.dragOver : ""}`}
                            onClick={() => onNavigate(folder)}
                            onMouseEnter={() =>
                                handleMouseEnter(folder.id ?? null)
                            }
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={() => handleMouseUp(folder.id ?? null)}
                        >
                            {folder.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
