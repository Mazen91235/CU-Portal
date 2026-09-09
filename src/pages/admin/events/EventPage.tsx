import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import type { Event } from "../../../types/entities/Event";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import useAuthQuery from "../../../hooks/useAuthQuery";
// import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { formatDateTime } from "../../../utils/Formatter";
import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./EventPage.module.css";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { showToast } from "../../../utils/ToastsManager";
import ConfirmModal from "../../../components/modal/ConfirmModal";

export const EventPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const fetchEvent = useCallback(async () => {
        if (!eventId) return;
        
        // fetching event data logic from API
        setEvent({
            id: parseInt(eventId),
            name: "Sample Event",
            img: "https://tse1.mm.bing.net/th/id/OIP.lZcTQuv69wOV10v9JtAc2wHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
            start_time: "2023-10-10T10:00:00Z",
            location: "Sample Location",
            price: 0,
        });
    }, [eventId]);
    
    const authQueryParams = useCallback(() => fetchEvent(), [fetchEvent]);
    
    useAuthQuery(authQueryParams);

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    }

    const handleDeleteEvent = async () => {
        if (!event) return;
        
        // call delete event endpoint
        setIsDeleteModalOpen(false);
        showToast("success", "Success", "Event deleted successfully");
    }
    
    if (!event) {
        return null;
    }

    return (
        <Layout>
            <PageSeo
                title={`${event.name} - Event Details - CU Portal`}
                description={`View event information for ${event.name}`}
            />

            <SubBanner
                title={event.name || "Event Details"}
                img={event.img || ""}
                button="Edit Event"
                buttonAction={() => navigate(`/admin/events/edit/${event.id}`)}
                deleteButton="Delete Event"
                deleteAction={handleDeleteClick}
                linkText="Back to Events"
                linkTo="/user/events"
            />

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.statsContainer}>
                        <h3 className={styles.statsTitle}>Event Information</h3>
                        <div className={styles.statsGrid}>
                            <StatCard
                                type="Date"
                                value={formatDateTime(event.start_time) || "N/A"}
                                icon="calendar"
                            />
                            <StatCard
                                type="Price"
                                value={
                                    event.price !== undefined
                                        ? event.price === 0
                                            ? "Free"
                                            : `$${event.price}`
                                        : "N/A"
                                }
                                icon="dollar-sign"
                            />
                            <StatCard
                                type="Attendees"
                                value={event.attendees !== undefined ? event.attendees?.toString() : "N/A"}
                                icon="people"
                            />
                            <StatCard 
                                type="Location"
                                value={event.location || "N/A"}
                                icon="location"
                            />
                        </div>
                    </div>

                    <div className={styles.detailsContainer}>
                        {event.instructions && (
                            <LongSection
                                title="Event Instructions"
                                icon="file-text"
                            >
                                <div className={styles.descriptionContent}>
                                    {event.instructions && (
                                        <ul>
                                            {event.instructions
                                            .split("\n")
                                            .map((instruction, index) => (
                                                <div
                                                    key={index}
                                                    className={
                                                        styles.instruction
                                                    }
                                                >
                                                    <li>{instruction}</li>
                                                </div>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </LongSection>
                        )}

                        <LongSection title="Description" icon="align-left">
                            {event.description || (
                                <span>No description available</span>
                            )}
                        </LongSection>
                    </div>
                    <div className={styles.attachments}>
                        {event.urls && event.urls.length > 0 && (
                            <AttachmentsAndLinksSection
                                files={[]}
                                links={[]}
                            /> 
                        )}
                    </div>
                </div>
                <div className={styles.sideInfo}>
                   { /* event creator card */ }

                    <QuickInfoSection
                        items={[
                            { label: "Type:", value: "Event" },
                            {
                                label: "Location:",
                                value: event.location || "N/A",
                            },
                        ]}
                    />
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEvent}
                confirmText={isProcessing ? "Processing..." : "Delete"}
                title="Delete Event?"
                message={`Are you sure you want to delete "${event.name}"?`}
                colorType="red"
            />
        </Layout>
    );
};