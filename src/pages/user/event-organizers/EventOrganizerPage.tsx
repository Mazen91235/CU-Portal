import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Bordered } from "../../../components/bordered/Bordered";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { useLazyGetEventOrganizerQuery } from "../../../services/apis/user/EventOrganizerAPIs";
import type { EventOrganizerResponseDto } from "../../../types/dtos/EventOrganizerDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import styles from "./EventOrganizerPage.module.css";

export const EventOrganizerPage = () => {
    const { eventOrganizerId } = useParams<{ eventOrganizerId: string }>();
    const navigate = useNavigate();
    const [organizer, setOrganizer] = useState<EventOrganizerResponseDto | null>(null);
    const [getOrganizer] = useLazyGetEventOrganizerQuery();

    const fetchOrganizer = useCallback(async () => {
        if (!eventOrganizerId) return;

        try {
            const result = await getOrganizer({
                event_organizer_id: parseInt(eventOrganizerId),
            }).unwrap();
            setOrganizer(result.data || null);
        } catch (error) {
            handlePopupErrors(error);
            navigate("/user/events");
        }
    }, [eventOrganizerId, getOrganizer, navigate]);

    useAuthQuery(fetchOrganizer);

    if (!organizer) return null;

    const initials = (organizer.name || "EO")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "EO";

    return (
        <Layout>
            <PageSeo
                title={`${organizer.name || "Event Organizer"} - CU Portal`}
                description={`View information about ${organizer.name || "this event organizer"}`}
            />
            <SubBanner
                title={organizer.name || "Event Organizer"}
                icon="calendar"
                img={organizer.logo?.url || undefined}
                linkText="Back to Events"
                linkTo="/user/events"
            />

            <div className={styles.container}>
                <Bordered>
                    <div className={styles.hero}>
                        {organizer.logo?.url ? (
                            <img
                                src={organizer.logo.url}
                                alt={`${organizer.name || "Event organizer"} logo`}
                                className={styles.logo}
                            />
                        ) : (
                            <div className={styles.fallbackLogo}>{initials}</div>
                        )}
                        <h2>{organizer.name || "Event Organizer"}</h2>
                    </div>
                </Bordered>

                {organizer.attachments && organizer.attachments.length > 0 && (
                    <AttachmentsAndLinksSection
                        attachments={organizer.attachments}
                    />
                )}
            </div>
        </Layout>
    );
};
