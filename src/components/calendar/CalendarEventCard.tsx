import { Link } from "react-router";
import type { EventResponseDto } from "../../types/dtos/EventDtos";
import { formatDateTime } from "../../utils/Formatter";
import IconComponent from "../IconComponent";
import styles from "./CalendarEventCard.module.css";

export const CalendarEventCard = ({ event }: { event: EventResponseDto }) => (
    <div className={styles.card}>
        <div className={styles.content}>
            <div className={styles.titleRow}>
                <h4 className={styles.title}>{event.title || "Untitled event"}</h4>
                <span className={styles.badge}>Event</span>
            </div>
            <div className={styles.detail}>
                <IconComponent icon="time" className={styles.icon} />
                Start: {event.start_date ? formatDateTime(event.start_date, false) : "N/A"}
            </div>
            <div className={styles.detail}>
                <IconComponent icon="time" className={styles.icon} />
                End: {event.end_date ? formatDateTime(event.end_date, false) : "N/A"}
            </div>
            {event.location && (
                <div className={styles.detail}>
                    <IconComponent icon="location" className={styles.icon} />
                    {event.location}
                </div>
            )}
        </div>
        <Link to={`/user/events/${event.id}`} className={styles.viewButton}>
            View
        </Link>
    </div>
);
