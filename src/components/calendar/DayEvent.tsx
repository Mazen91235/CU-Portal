import { Link } from "react-router";

import styles from "./DayEvent.module.css";
import { GetIcon } from "../../utils/LinkHandler";

export const DayEvent = ({
    type,
    title,
    subject,
    due,
    location,
    id,
}: {
    type: "exam" | "assignment" | "event";
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
            case "event":
                return styles["badge-event"];
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
            case "event":
                return "#";
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
            case "event":
                return "Event";
            default:
                return "";
        }
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
                        <img
                            src={GetIcon("subject")}
                            alt="Subject"
                            className={styles["detail-icon"]}
                        />
                        {subject ? `Subject: ${subject}` : ""}
                    </div>
                )}
                {due && (
                    <div className={styles["event-detail"]}>
                        <img
                            src={GetIcon("time")}
                            alt="Due"
                            className={styles["detail-icon"]}
                        />
                        {due ? `Due: ${due}` : ""}
                    </div>
                )}
                {location && (
                    <div className={styles["event-detail"]}>
                        <img
                            src={GetIcon("location")}
                            alt="Location"
                            className={styles["detail-icon"]}
                        />
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
