import { Link } from "react-router";

import styles from "./DayEvent.module.css";
import IconComponent from "../IconComponent";

export const DayEvent = ({
    type,
    title,
    subject,
    due,
    location,
    id,
}: {
    type: "exam" | "assignment" | "announcement";
    title: string;
    subject?: string;
    due?: string;
    location?: string;
    id: number;
}) => {
    const getBadgeClass = () => {
        switch (type) {
            case "exam":
                return styles["badge-exam"];
            case "assignment":
                return styles["badge-assignment"];
            case "announcement":
                return styles["badge-announcement"];
            default:
                return "";
        }
    };

    const getViewLink = () => {
        switch (type) {
            case "exam":
                return `/user/exams/${id}`;
            case "assignment":
                return `/user/tasks/${id}`;
            case "announcement":
                return `/user/announcements/${id}`;
            default:
                return "#";
        }
    };

    const getBadgeText = () => {
        switch (type) {
            case "exam":
                return "Exam";
            case "assignment":
                return "Assignment";
            case "announcement":
                return "Announcement";
            default:
                return "";
        }
    };

    const getDateLabel = () => {
        return type === "announcement" ? "Date" : "Due";
    };

    return (
        <div className={styles["event-card"]}>
            <div className={styles["event-content"]}>
                <div className={styles["event-title"]}>
                    {title}{" "}
                    <span className={`${styles["badge"]} ${getBadgeClass()}`}>
                        {getBadgeText()}
                    </span>
                </div>
                {subject && (
                    <div className={styles["event-detail"]}>
                        <IconComponent icon="subject" className={styles["detail-icon"]} />
                        {subject ? `Subject: ${subject}` : ""}
                    </div>
                )}
                {due && (
                    <div className={styles["event-detail"]}>
                        <IconComponent icon="time" className={styles["detail-icon"]} />
                        {due ? `${getDateLabel()}: ${due}` : ""}
                    </div>
                )}
                {location && (
                    <div className={styles["event-detail"]}>
                        <IconComponent icon="location" className={styles["detail-icon"]} />
                        {location}
                    </div>
                )}
            </div>
            <Link to={getViewLink()} className={styles["view-btn-wrapper"]}>
                <div className={styles["view-btn"]}>View</div>
                {/* <div className={styles["view-btn"]}>View {getBadgeText()}</div> */}
            </Link>
        </div>
    );
};
