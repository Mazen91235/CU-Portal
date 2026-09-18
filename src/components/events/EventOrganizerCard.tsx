import { Bordered } from "../bordered/Bordered";
import { Button } from "../forms/Button";
import type { EventOrganizerResponseDto } from "../../types/dtos/EventOrganizerDtos";
import { GetDrivePreviewUrlFromUrl } from "../../utils/DriveManager";
import { formatString } from "../../utils/Formatter";
import defaultEventOrganizerLogo from "../../assets/default event organizer logo.jpg";

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
    const logo = organizer.logo?.url || defaultEventOrganizerLogo;
    return (
        <Bordered>
            <div className={styles.container}>
                <h3 className={styles.title}>Event Organizer</h3>

                <div className={styles.logoWrapper}>
                    <img
                        src={GetDrivePreviewUrlFromUrl(logo) || logo}
                        alt={`${name} logo`}
                        className={styles.logo}
                    />
                </div>

                <h4 className={styles.name}>{formatString(name, "CardTitle")}</h4>

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
