import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { buildRedirectUrl } from "../../../utils/Navigation";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { Card } from "../../../components/card/Card";
import { EventOrganizerCard } from "../../../components/events/EventOrganizerCard";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { Heading } from "../../../components/heading/Heading";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useLazyGetEventOrganizerQuery } from "../../../services/apis/admin/EventOrganizerAPIs";
import type { EventOrganizerResponseDto } from "../../../types/dtos/EventOrganizerDtos";
import { formatDateTime } from "../../../utils/Formatter";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import defaultEventThumbnail from "../../../assets/default event thumbnail.jpg";

import styles from "./EventOrganizerPage.module.css";

export const EventOrganizerPage = () => {
    const navigate = useNavigate();
    const { eventOrganizerId } = useParams<{ eventOrganizerId: string }>();
    const [organizer, setOrganizer] =
        useState<EventOrganizerResponseDto | null>(null);
    const [getEventOrganizer] = useLazyGetEventOrganizerQuery();

    const fetchOrganizer = useCallback(async () => {
        if (!eventOrganizerId) return;
        try {
            const result = await getEventOrganizer({
                event_organizer_id: Number(eventOrganizerId),
            }).unwrap();
            setOrganizer(result.data || null);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getEventOrganizer, eventOrganizerId]);

    useAuthQuery(fetchOrganizer);

    const events = organizer?.events || [];
    const attachments = organizer?.attachments || [];
    const attendeeCount = events.reduce(
        (total, event) => total + (event.attendees?.length || 0),
        0,
    );

    const shareEvent = (eventId: number) => {
        copyToClipboard(`${window.location.origin}/admin/events/${eventId}`);
        showToast(
            "success",
            "Success",
            "Event link copied to clipboard successfully",
        );
    };

    if (!organizer) return null;

    return (
        <Layout>
            <PageSeo
                title={`${organizer.name || "Event Organizer"} - CU Portal`}
                description="View event organizer details and events"
            />
            <SubBanner
                title={organizer.name || "Event Organizer"}
                icon="user"
                linkText="Back to Event Organizers"
                linkTo="/admin/event-organizers"
                button="Edit Organizer"
                buttonAction={() =>
                    navigate(buildRedirectUrl(`/admin/event-organizers/edit/${organizer.id}`))
                }
            />
            <main className={styles.container}>
                <div className={styles.statsRow}>
                    <StatCard
                        type="Number of Events"
                        value={events.length}
                        icon="calendar"
                    />
                    <StatCard
                        type="Total Attendees"
                        value={attendeeCount}
                        icon="people"
                    />
                </div>

                <div className={styles.infoGrid}>
                    <section className={styles.attachmentsSection}>
                        {attachments.length > 0 ? (
                            <AttachmentsAndLinksSection
                                attachments={attachments}
                            />
                        ) : (
                            <NoContentSection
                                icon="paperclip"
                                label="No attachments found for this organizer"
                            />
                        )}
                    </section>
                    <aside className={styles.organizerSidebar}>
                        <EventOrganizerCard organizer={organizer} />
                    </aside>
                </div>

                <section className={styles.eventsSection}>
                    <Heading icon="calendar" content="Events" size="large" />
                    <div className={styles.eventsGrid}>
                        {events.map((event) => (
                            <Card
                                key={event.id}
                                title={event.title || ""}
                                img={event.logo?.url || defaultEventThumbnail}
                                badge={
                                    event.price === 0
                                        ? "Free"
                                        : event.price != null
                                          ? `${event.price.toFixed(2)} EGP`
                                          : ""
                                }
                                items={[
                                    {
                                            icon: "calendar",
                                            label: "Start Date",
                                            value:
                                                formatDateTime(
                                                    event.start_date,
                                                ) || "N/A",
                                    },
                                    {
                                            icon: "calendar",
                                            label: "End Date",
                                            value:
                                                formatDateTime(
                                                    event.end_date,
                                                ) || "N/A",
                                    },
                                    {
                                            icon: "location",
                                            label: "Location",
                                            value: event.location || "N/A",
                                        },
                                ]}
                                button="View Event"
                                buttonAction={() =>
                                    navigate(buildRedirectUrl(`/admin/events/${event.id}`))
                                }
                                hasOptions
                                sharable
                                onShare={() =>
                                    event.id && shareEvent(event.id)
                                }
                            />
                        ))}
                    </div>
                    {events.length === 0 && (
                        <NoContentSection
                                icon="calendar"
                                label="No events found for this organizer"
                        />
                    )}
                </section>
            </main>
        </Layout>
    );
};
