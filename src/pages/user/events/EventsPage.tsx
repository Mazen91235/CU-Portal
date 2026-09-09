import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import type { EventResponseDto } from "../../../types/dtos/EventDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useLazyGetEventsQuery } from "../../../services/apis/user/EventAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { Card } from "../../../components/card/Card";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { formatDateTime } from "../../../utils/Formatter";

import styles from "./EventsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";
import { SelectFilter } from "../../../components/forms/SelectFilter";

export const EventsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [eventTypeFilter, setEventTypeFilter] = useState("");
    const [events, setEvents] = useState<EventResponseDto[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [getEvents, { isFetching }] = useLazyGetEventsQuery();

    const eventTypeOptions = [
        { label: "Location Type", value: "" },
        { label: "Offline", value: "Offline" },
        { label: "Online", value: "Online" },
    ];

    const fetchEvents = useCallback(async () => {
        if (!hasNextPage && page !== 1) return;

        try {
            const result = await getEvents({
                data: {
                    query: searchQuery || undefined,
                    location_type:
                        eventTypeFilter === "Online" ||
                        eventTypeFilter === "Offline"
                            ? eventTypeFilter
                            : undefined,
                },
                includes: [
                    "faculty",
                    "department",
                    "year",
                    "event_organizer",
                    "logo",
                    "attachments",
                ],
                page,
            }).unwrap();

            setEvents((prev) => {
                if (page === 1) return result.data || [];
                const ids = new Set(
                    (result.data || []).map((event) => event.id),
                );
                return [
                    ...prev.filter((event) => !ids.has(event.id)),
                    ...(result.data || []),
                ];
            });
            setHasNextPage(result.next_page || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [eventTypeFilter, getEvents, hasNextPage, page, searchQuery]);

    const authQueryParams = useCallback(() => fetchEvents(), [fetchEvents]);
    useAuthQuery(authQueryParams);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, eventTypeFilter]);

    const handlePagination = () => {
        if (hasNextPage && !isFetching && events.length > 0) {
            setPage((current) => current + 1);
        }
    };

    const handleShareEvent = (eventId: number) => {
        copyToClipboard(`${window.location.origin}/user/events/${eventId}`);
        showToast(
            "success",
            "Success",
            "Event link copied to clipboard successfully",
        );
    };

    return (
        <Layout>
            <PageSeo
                title="Events - CU Portal"
                description="Discover amazing events happening on campus"
            />
            <Banner
                title="Events"
                description="Discover amazing events happening on campus"
            />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.search}>
                        <Search
                            placeholder="Search events..."
                            setValue={setSearchQuery}
                        />
                    </div>
                    <div className={styles.filters}>
                        <SelectFilter
                            options={eventTypeOptions}
                            setValue={setEventTypeFilter}
                        />
                    </div>
                </div>

                <div className={styles.eventsGrid}>
                    {events.map((event) => (
                        <Card
                            key={event.id}
                            title={event.title || ""}
                            img={event.logo?.url || ""}
                            badge={
                                event.price !== undefined &&
                                event.price !== null
                                    ? event.price === 0
                                        ? "Free"
                                        : `${event.price.toFixed(2)} EGP`
                                    : ""
                            }
                            items={[
                                {
                                    icon: "calendar",
                                    label: "Date",
                                    value:
                                        formatDateTime(event.start_date) ||
                                        "N/A",
                                },
                                {
                                    icon: "location",
                                    label: "Location",
                                    value: event.location || "N/A",
                                },
                            ]}
                            button="View Details"
                            buttonAction={() =>
                                navigate(`/user/events/${event.id}`)
                            }
                            hasOptions
                            sharable
                            onShare={() => handleShareEvent(event.id!)}
                        />
                    ))}
                </div>

                {events.length === 0 && (
                    <NoContentSection icon="calendar" label="No events found" />
                )}
                <Pagination onReached={handlePagination} />
            </div>
        </Layout>
    );
};
