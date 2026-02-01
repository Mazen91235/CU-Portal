import styles from "./StatCard.module.css";

type StatCardProps = {
    type: string;
    value: string | number | React.ReactNode;
    icon: string;
};

export const StatCard = ({ type, value, icon }: StatCardProps) => {
    const getIconConfig = (iconType: string) => {
        const configs: Record<
            string,
            { bgColor: string; iconColor: string; iconClass: string }
        > = {
            calendar: {
                bgColor: "rgba(37, 99, 235, 0.1)",
                iconColor: "#2563eb",
                iconClass: "fa-calendar",
            },
            people: {
                bgColor: "rgba(22, 163, 74, 0.1)",
                iconColor: "#16a34a",
                iconClass: "fa-users",
            },
            tag: {
                bgColor: "rgba(22, 163, 74, 0.1)",
                iconColor: "#16a34a",
                iconClass: "fa-tag",
            },
            check: {
                bgColor: "rgba(22, 163, 74, 0.1)",
                iconColor: "#16a34a",
                iconClass: "fa-user-check",
            },
            book: {
                bgColor: "rgba(168, 85, 247, 0.1)",
                iconColor: "#a855f7",
                iconClass: "fa-book",
            },
        };

        return (
            configs[iconType] || {
                bgColor: "rgba(107, 114, 128, 0.1)",
                iconColor: "#6b7280",
                iconClass: "fa-info-circle",
            }
        );
    };

    const config = getIconConfig(icon);

    return (
        <div className={styles.statCard}>
            <div
                className={styles.statImgbox}
                style={{ backgroundColor: config.bgColor }}
            >
                <i
                    className={`fas ${config.iconClass}`}
                    style={{ color: config.iconColor }}
                ></i>
            </div>
            <div className={styles.statTexts}>
                <div className={styles.statTitle}>{type}</div>
                <div className={styles.statValue}>{value}</div>
            </div>
        </div>
    );
};
