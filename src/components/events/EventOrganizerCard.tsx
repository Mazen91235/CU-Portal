import { Bordered } from "../bordered/Bordered";
import { Button } from "../forms/Button";
import type { EventOrganizerResponseDto } from "../../types/dtos/EventOrganizerDtos";
import { GetDrivePreviewUrlFromUrl } from "../../utils/DriveManager";
import styles from "./EventOrganizerCard.module.css";

type EventOrganizerCardProps = {
    organizer: EventOrganizerResponseDto;
    onView?: () => void;
};

export const EventOrganizerCard = ({
    organizer,
    onView,
}: EventOrganizerCardProps) => {
    const name = organizer.name || "Unknown Organizer";
    const logo = organizer.logo?.url;
    const initials =
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "EO";

    return (
        <Bordered>
            <div className={styles.container}>
                <h3 className={styles.title}>Event Organizer</h3>

                <div className={styles.logoWrapper}>
                    {logo ? (
                        <img
                            src={GetDrivePreviewUrlFromUrl(logo) || logo}
                            alt={`${name} logo`}
                            className={styles.logo}
                        />
                    ) : (
                        <div className={styles.fallbackLogo} aria-hidden="true">
                            {initials}
                        </div>
                    )}
                </div>

                <h4 className={styles.name}>{name}</h4>

                {onView && organizer.id ? (
                    <Button
                        text="View"
                        loadingText="Loading..."
                        type="button"
                        isSubmitting={false}
                        isDefault
                        onClick={onView}
                        className={styles.viewButton}
                    />
                ) : (
                    <></>
                )}
            </div>
        </Bordered>
    );
};
