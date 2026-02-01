import { Bordered } from "../bordered/Bordered";
import { Heading } from "../heading/Heading";

import styles from "./QuickInfoSection.module.css";

type QuickInfoItem = {
    label: string;
    value: string;
};

export const QuickInfoSection = ({ items }: { items: QuickInfoItem[] }) => {
    return (
        <Bordered>
            <Heading icon="info-circle" content="Quick Info" size="large" />
            <div className={styles.quickInfoList}>
                {items.map((item, index) => (
                    <div key={index} className={styles.quickInfoRow}>
                        <span className={styles.quickInfoLabel}>
                            {item.label}
                        </span>
                        <span className={styles.quickInfoValue}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </Bordered>
    );
};
