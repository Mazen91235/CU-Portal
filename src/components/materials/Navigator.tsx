import type { Material } from "../../types/entities/Material";
import styles from "./Navigator.module.css";

interface NavigatorProps {
    path: Material[];
    onNavigate: (material: Material | null) => void;
    onDrop?: (targetId: number | null) => void;
}

export function Navigator({ path, onNavigate, onDrop }: NavigatorProps) {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add(styles.dragOver);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove(styles.dragOver);
    };

    const handleDrop = (e: React.DragEvent, targetId: number | null) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove(styles.dragOver);

        const materialId = e.dataTransfer.getData("materialId");
        if (materialId && onDrop) {
            onDrop(targetId);
        }
    };

    return (
        <div className={styles.navigator}>
            <div className={styles.breadcrumb}>
                <button
                    className={styles.breadcrumbItem}
                    onClick={() => onNavigate(null)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, null)}
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
                            className={`${styles.breadcrumbItem} ${index === path.length - 1 ? styles.active : ""}`}
                            onClick={() => onNavigate(folder)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, folder.id ?? null)}
                        >
                            {folder.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
