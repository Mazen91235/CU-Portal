import { Link } from "react-router";
import type { CalendarDayEventDto } from "../../types/dtos/CalendarDtos";
import styles from "./DayEvent.module.css";
import IconComponent from "../IconComponent";
import { formatDate, formatDateTime, formatString } from "../../utils/Formatter";

export const DayEvent = ({
    event_type,
    title,
    subject,
    due,
    location,
    id,
    created_at,
    date,
}: CalendarDayEventDto & {
    onEdit?: () => void;
    onDelete?: () => void;
}) => {
    const getBadgeClass = () => {
        switch (event_type) {
            case "exam":
                return styles["badge-exam"];
            case "assignment":
                return styles["badge-assignment"];
            case "announcement":
                return styles["badge-announcement"];
            case "note":
                return styles["badge-note"];
            default:
                return "";
        }
    };

    const getViewLink = () => {
        switch (event_type) {
            case "exam":
                return `/user/exams/${id}`;
            case "assignment":
                return `/user/tasks/${id}`;
            case "announcement":
                return `/user/announcements/${id}`;
            case "note":
                return `/user/notes/${id}`;
            default:
                return "#";
        }
    };

    const getBadgeText = () => {
        switch (event_type) {
            case "exam":
                return "Exam";
            case "assignment":
                return "Assignment";
            case "announcement":
                return "Announcement";
            case "note":
                return "Note";
            default:
                return "";
        }
    };

    const getDateLabel = () => {
        return event_type === "announcement" ? "Date" : "Due";
    };

    return (
        <div className={styles["event-card"]}>
            <div className={styles["event-content"]}>
                <div className={styles["event-title"]}>
                    {formatString(title, "CalendarCardTitle")} {" "}
                    <span className={`${styles["badge"]} ${getBadgeClass()}`}>
                        {getBadgeText()}
                    </span>
                </div>
                {subject && (
                    <div className={styles["event-detail"]}>
                        <IconComponent
                            icon="subject"
                            className={styles["detail-icon"]}
                        />
                        {subject ? <>Subject: {formatString(subject, "CalendarCardContent")}</> : ""}
                    </div>
                )}
                {due && (
                    <div className={styles["event-detail"]}>
                        <IconComponent
                            icon="time"
                            className={styles["detail-icon"]}
                        />
                        {due
                            ? `${getDateLabel()}: ${formatDateTime(due, false)}`
                            : ""}
                    </div>
                )}
                {location && (
                    <div className={styles["event-detail"]}>
                        <IconComponent
                            icon="location"
                            className={styles["detail-icon"]}
                        />
                        {formatString(location, "CalendarCardContent")}
                    </div>
                )}
                {created_at && (
                    <div className={styles["event-detail"]}>
                        <IconComponent
                            icon="calendar"
                            className={styles["detail-icon"]}
                        />
                        Created at: {formatDate(created_at)} 
                    </div>
                )}
                {date && (
                    <div className={styles["event-detail"]}>
                        <IconComponent
                            icon="time"
                            className={styles["detail-icon"]}
                        />
                        Date: {formatDate(date)}
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
