import { useState, useCallback } from "react";
import { useParams } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import type { Event } from "../../../types/entities/Event";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { Bordered } from "../../../components/bordered/Bordered";
import { LongSection } from "../../../components/section/LongSection";
import useAuthQuery from "../../../hooks/useAuthQuery";
// import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { formatDateTime } from "../../../utils/Formatter";
import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./EventPage.module.css";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { Button } from "../../../components/forms/Button";
import { showToast } from "../../../utils/ToastsManager";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import ConfirmModal from "../../../components/modal/ConfirmModal";

export const EventPage = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false); // to be fetched from the backend to check if the user is already registered for the event

    
    const fetchEvent = useCallback(async () => {
        if (!eventId) return;
        
        // Simulate fetching event data from an API
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
    
    const handleRegisterClick = () => {
        setIsRegisterModalOpen(true);
    };

    // to be implemented 
    function handleRegisterEvent(): void {
        if (!event) return;
        
        setIsProcessing(true);

        if (isRegistered) {
            // Unregister logic here
            setIsRegistered(false);
            showToast("success", "Success", `You have unregistered from "${event.name}"`);
        } else {
            // Register logic here
            setIsRegistered(true);
            showToast("success", "Success", `You have registered for "${event.name}"`);
        }
        
        setIsRegisterModalOpen(false);
        setIsProcessing(false);
    }

    const handleShareEvent = (eventId: number) => {
        const url = `${window.location.origin}/user/events/${eventId}`;
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "event link copied to clipboard successfully",
        );
    };
    
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
                    <Bordered>
                        <div className={styles.quickActions}>
                            <h4>Quick Actions</h4>
                            <Button
                                text={isRegistered ? "Unregister from Event" : "Register for Event"}
                                isSubmitting={false}
                                loadingText={isRegistered ? "Unregistering..." : "Registering..."}
                                isOrange={false}
                                isSecondary={isRegistered? true : false}
                                onClick={handleRegisterClick}
                            />
                            <Button
                                text="Share Event"
                                isSubmitting={false}
                                loadingText="Sharing..."
                                isSecondary={true}
                                onClick={()=> handleShareEvent(event.id!)} 
                            />
                        </div>
                    </Bordered> 
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
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onConfirm={handleRegisterEvent}
                confirmText={isProcessing ? "Processing..." : isRegistered ? "Unregister" : "Register"}
                title={isRegistered ? "Unregister from Event?" : "Register for Event?"}
                message={`Are you sure you want to ${isRegistered ? "unregister from" : "register for"} "${event.name}"?`}
                colorType={isRegistered ? "red" : "green"}
            />
        </Layout>
    );
};