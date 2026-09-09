import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import type { EventResponseDto } from "../../../types/dtos/EventDtos";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { Bordered } from "../../../components/bordered/Bordered";
import { LongSection } from "../../../components/section/LongSection";
import useAuthQuery from "../../../hooks/useAuthQuery";
// import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { formatDateTime } from "../../../utils/Formatter";

import styles from "./EventPage.module.css";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { Button } from "../../../components/forms/Button";
import { showToast } from "../../../utils/ToastsManager";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { EventOrganizerCard } from "../../../components/events/EventOrganizerCard";
import {
    useLazyGetEventQuery,
    useRegisterEventMutation,
    useUnregisterEventMutation,
} from "../../../services/apis/user/EventAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { useAppSelector } from "../../../services/redux/Hooks";

export const EventPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventResponseDto | null>(null);
    const user = useAppSelector((state) => state.user.user);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);

    const [getEvent] = useLazyGetEventQuery();
    const [registerEvent] = useRegisterEventMutation();
    const [unregisterEvent] = useUnregisterEventMutation();

    const fetchEvent = useCallback(async () => {
        if (!eventId) return;

        try {
            const result = await getEvent({
                event_id: parseInt(eventId),
                includes: [
                    "faculty",
                    "department",
                    "year",
                    "event_organizer",
                    "logo",
                    "attachments",
                    "attendees",
                ],
            }).unwrap();
            const eventData = result.data || null;
            setEvent(eventData);
            const userId = user?.id;
            setIsRegistered(
                Boolean(
                    userId &&
                    eventData?.attendees?.some(
                        (attendee) => attendee.id === userId,
                    ),
                ),
            );
        } catch (error) {
            handlePopupErrors(error);
            navigate("/user/events");
        }
    }, [eventId, getEvent, navigate, user?.id]);

    useAuthQuery(fetchEvent);

    const handleRegisterClick = () => setIsRegisterModalOpen(true);

    const handleRegisterEvent = async () => {
        if (!event?.id) return;
        try {
            setIsProcessing(true);
            if (isRegistered) {
                await unregisterEvent({ event_id: event.id }).unwrap();
                setIsRegistered(false);
                showToast(
                    "success",
                    "Success",
                    `You have unregistered from "${event.title}"`,
                );
            } else {
                await registerEvent({ event_id: event.id }).unwrap();
                setIsRegistered(true);
                showToast(
                    "success",
                    "Success",
                    `You have registered for "${event.title}"`,
                );
            }
            setIsRegisterModalOpen(false);
        } catch (error) {
            handlePopupErrors(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleShareEvent = (id: number) => {
        copyToClipboard(`${window.location.origin}/user/events/${id}`);
        showToast(
            "success",
            "Success",
            "Event link copied to clipboard successfully",
        );
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
                description={`View event information for ${event.title || "this event"}`}
            />

            <SubBanner
                title={event.title || "Event Details"}
                img={event.logo?.url || undefined}
                icon="calendar"
                linkText="Back to Events"
                linkTo="/user/events"
            />

            <div className={styles.container}>
                <div className={styles.content}>
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
                        <StatCard
                            type="Price"
                            value={price}
                            icon="dollar-sign"
                        />
                        <StatCard
                            type="Attendees"
                            value={event.attendees?.length ?? 0}
                            icon="people"
                        />
                    </div>

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

                <div className={styles.sideInfo}>
                    <Bordered>
                        <div className={styles.quickActions}>
                            <h4>Quick Actions</h4>
                            <Button
                                text={
                                    isRegistered
                                        ? "Unregister from Event"
                                        : "Register for Event"
                                }
                                isSubmitting={false}
                                loadingText={
                                    isRegistered
                                        ? "Unregistering..."
                                        : "Registering..."
                                }
                                isOrange={false}
                                isSecondary={isRegistered}
                                onClick={handleRegisterClick}
                            />
                            <Button
                                text="Share Event"
                                isSubmitting={false}
                                loadingText="Sharing..."
                                isSecondary
                                onClick={() => handleShareEvent(event.id!)}
                            />
                        </div>
                    </Bordered>

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
                        ]}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onConfirm={handleRegisterEvent}
                confirmText={
                    isProcessing
                        ? "Processing..."
                        : isRegistered
                          ? "Unregister"
                          : "Register"
                }
                title={
                    isRegistered
                        ? "Unregister from Event?"
                        : "Register for Event?"
                }
                message={`Are you sure you want to ${isRegistered ? "unregister from" : "register for"} "${event.title}"?`}
                colorType={isRegistered ? "red" : "green"}
            />
        </Layout>
    );
};
