import { useState, useCallback, useEffect, useMemo } from "react";
import { buildRedirectUrl } from "../../../utils/Navigation";
import { useNavigate } from "react-router";
import type { EventResponseDto } from "../../../types/dtos/EventDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { useLazyGetEventsQuery } from "../../../services/apis/user/EventAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { Card } from "../../../components/card/Card";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { formatDateTime, toIsoFormat } from "../../../utils/Formatter";

import defaultEventThumbnail from "../../../assets/default event thumbnail.jpg";

import styles from "./EventsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { DateFilter } from "../../../components/forms/DateFilter";
import { useLazyGetEventOrganizersQuery } from "../../../services/apis/user/EventOrganizerAPIs";
import type { EventOrganizerResponseDto } from "../../../types/dtos/EventOrganizerDtos";

export const EventsPage = () => {
    const navigate = useNavigate();
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");
    const eventTypeFilter = getFilter("event_type", "");
    const setEventTypeFilter = getFilterSetter("event_type");
    const eventOrganizerFilter = getFilter("event_organizer_id", "");
    const setEventOrganizerFilter = getFilterSetter("event_organizer_id");
    const dateFromFilter = getFilter("date_from", new Date().toLocaleDateString("en-CA"));
    const setDateFromFilter = getFilterSetter("date_from", true);
    const dateToFilter = getFilter("date_to", "");
    const setDateToFilter = getFilterSetter("date_to", true);
    const [eventOrganizers, setEventOrganizers] = useState<
        EventOrganizerResponseDto[]
    >([]);
    const [events, setEvents] = useState<EventResponseDto[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [getEvents, { isFetching }] = useLazyGetEventsQuery();
    const [getEventOrganizers] = useLazyGetEventOrganizersQuery();

    const eventTypeOptions = [
        { label: "Location Type", value: "" },
        { label: "Offline", value: "Offline" },
        { label: "Online", value: "Online" },
    ];

    const fetchEventOrganizers = useCallback(async () => {
        try {
            const result = await getEventOrganizers({ data: {} }).unwrap();
            setEventOrganizers(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getEventOrganizers]);

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
                    event_organizer_id: eventOrganizerFilter
                        ? parseInt(eventOrganizerFilter)
                        : undefined,
                    start_date_from: toIsoFormat(dateFromFilter),
                    start_date_to: toIsoFormat(dateToFilter),
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
    }, [
        eventOrganizerFilter,
        eventTypeFilter,
        dateFromFilter,
        dateToFilter,
        getEvents,
        hasNextPage,
        page,
        searchQuery,
    ]);

    const authFilterQuery = useCallback(
        () => Promise.all([fetchEventOrganizers()]),
        [fetchEventOrganizers],
    );

    const authFetchEventsQuery = useCallback(
        () => fetchEvents(),
        [fetchEvents],
    );

    useAuthQuery(authFilterQuery);
    useAuthQuery(authFetchEventsQuery);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [
        searchQuery,
        eventTypeFilter,
        eventOrganizerFilter,
        dateFromFilter,
        dateToFilter,
    ]);

    const eventOrganizerOptions = useMemo(
        () => [
            { label: "Event Organizer", value: "" },
            ...eventOrganizers.map((organizer) => ({
                label: organizer.name || "",
                value: organizer.id?.toString() || "",
            })),
        ],
        [eventOrganizers],
    );

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
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search events..."
                            setValue={setSearchQuery} value={searchQuery}
                        />
                    </div>
                    <div className={styles.filtersRow}>
                        <SelectFilter
                            options={eventOrganizerOptions}
                            setValue={setEventOrganizerFilter} value={eventOrganizerFilter}
                        />
                        <SelectFilter
                            options={eventTypeOptions}
                            setValue={setEventTypeFilter} value={eventTypeFilter}
                        />
                        <DateFilter
                            placeholder="Date From"
                            setValue={setDateFromFilter}
                            defaultDate={dateFromFilter}
                            value={dateFromFilter}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateToFilter}
                            value={dateToFilter}
                            startDay={false}
                        />
                    </div>
                </div>

                <div className={styles.eventsGrid}>
                    {events.map((event) => (
                        <Card
                            key={event.id}
                            title={event.title || ""}
                            img={event.logo?.url || defaultEventThumbnail}
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
                                    label: "Start Date",
                                    value:
                                        formatDateTime(event.start_date) ||
                                        "N/A",
                                },
                                {
                                    icon: "calendar",
                                    label: "End Date",
                                    value:
                                        formatDateTime(event.end_date) || "N/A",
                                },
                                {
                                    icon: "location",
                                    label: "Location",
                                    value: event.location || "N/A",
                                },
                            ]}
                            button="View Details"
                            buttonAction={() =>
                                navigate(buildRedirectUrl(`/user/events/${event.id}`))
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
