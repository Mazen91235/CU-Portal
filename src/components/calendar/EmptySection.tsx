import type { Icon } from "../../types/Icon";
import { GetIcon } from "../../utils/LinkHandler";

import styles from "./EmptySection.module.css";

export const EmptySection = ({
    icon,
    title,
    description,
}: {
    icon: Icon;
    title: string;
    description?: string;
}) => {
    return (
        <div className={styles["empty-section"]}>
            <div className={styles["icon-wrapper"]}>
                <img
                    src={GetIcon(icon)}
                    alt={title}
                    className={styles["icon"]}
                />
            </div>
            <h5 className={styles["title"]}>{title}</h5>
            {description && (
                <p className={styles["description"]}>{description}</p>
            )}
        </div>
    );
};
