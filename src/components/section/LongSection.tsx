import { Bordered } from "../bordered/Bordered";
import { Heading } from "../heading/Heading";

import styles from "./LongSection.module.css";

export const LongSection = ({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children?: React.ReactNode;
}) => {
    return (
        <Bordered>
            <Heading icon={icon} content={title} size="large" />
            <div className={styles.content}>
                {!children || children.toString().trim() == "" ? (
                    <span>No content available</span>
                ) : (
                    children
                )}
            </div>
        </Bordered>
    );
};
