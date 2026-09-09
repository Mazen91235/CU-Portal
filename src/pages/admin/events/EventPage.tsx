import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
    useLazyGetEventQuery,
    useDeleteEventMutation,
} from "../../../services/apis/admin/EventAPIs";
import type { EventResponseDto } from "../../../types/dtos/EventDtos";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { EventOrganizerCard } from "../../../components/events/EventOrganizerCard";
import { LongSection } from "../../../components/section/LongSection";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { formatDateTime } from "../../../utils/Formatter";

import styles from "./EventPage.module.css";

export const EventPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventResponseDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [getEvent] = useLazyGetEventQuery();
    const [deleteEvent] = useDeleteEventMutation();

    const fetchEvent = useCallback(async () => {
        if (!eventId) return;

        try {
            const result = await getEvent({
                event_id: parseInt(eventId),
            }).unwrap();
            setEvent(result.data || null);
        } catch (error) {
            handlePopupErrors(error);
            navigate("/admin/events");
        }
    }, [eventId, getEvent, navigate]);

    const authQueryParams = useCallback(() => fetchEvent(), [fetchEvent]);

    useAuthQuery(authQueryParams);

    const handleDelete = async () => {
        if (!event?.id) return;

        try {
            await deleteEvent({ event_id: event.id }).unwrap();
            navigate("/admin/events", {
                state: { success: "Event deleted successfully!" },
            });
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    if (!event) return null;

    const price =
        event.price === undefined || event.price === null
            ? "N/A"
            : event.price === 0
              ? "Free"
              : `${event.price.toFixed(2)} EGP`;

    return (
        <Layout>
            <PageSeo
                title={`${event.title || "Event"} - Event Details - CU Portal`}
                description={`View and manage event information for ${event.title || "this event"}`}
            />

            <SubBanner
                title={event.title || "Event Details"}
                icon="calendar"
                img={event.logo?.url || undefined}
                button="Edit Event"
                buttonAction={() => navigate(`/admin/events/edit/${event.id}`)}
                deleteButton="Delete Event"
                deleteAction={() => setIsDeleteModalOpen(true)}
                linkText="Back to Events"
                linkTo="/admin/events"
            />

            <div className={styles.container}>
                <div className={styles.statsRow}>
                    <StatCard
                        type="Start Date"
                        value={formatDateTime(event.start_date) || "N/A"}
                        icon="calendar"
                    />
                    <StatCard
                        type="End Date"
                        value={formatDateTime(event.end_date) || "N/A"}
                        icon="calendar"
                    />
                    <StatCard type="Price" value={price} icon="dollar-sign" />
                    <StatCard
                        type="Attendees"
                        value={event.attendees?.length ?? 0}
                        icon="people"
                    />
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.mainContent}>
                        <LongSection title="Description" icon="align-left">
                            {event.details?.description || (
                                <span>No description available</span>
                            )}
                        </LongSection>

                        {event.attachments && event.attachments.length > 0 && (
                            <AttachmentsAndLinksSection
                                attachments={event.attachments}
                            />
                        )}
                    </div>

                    <div className={styles.sidebar}>
                        {event.event_organizer && (
                            <EventOrganizerCard
                                organizer={event.event_organizer}
                                onView={() =>
                                    navigate(
                                        `/user/event-organizers/${event.event_organizer?.id}`,
                                    )
                                }
                            />
                        )}

                        <QuickInfoSection
                            items={[
                                {
                                    label: "Location:",
                                    value: event.location || "N/A",
                                },
                                {
                                    label: "Location Type:",
                                    value: event.location_type || "N/A",
                                },
                                {
                                    label: "Organizer:",
                                    value: event.event_organizer?.name || "N/A",
                                },
                                {
                                    label: "Faculty:",
                                    value: event.faculty?.name || "N/A",
                                },
                                {
                                    label: "Department:",
                                    value: event.department?.name || "N/A",
                                },
                                {
                                    label: "Year:",
                                    value:
                                        event.year?.year?.toString() || "N/A",
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                confirmText="Delete"
                title="Delete Event"
                message={`Are you sure you want to delete "${event.title}"? This action cannot be undone.`}
                colorType="red"
            />
        </Layout>
    );
};
