import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { Event } from "../../../types/entities/Event";
import useAuthQuery from "../../../hooks/useAuthQuery";
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
    const [freeFilter, setFreeFilter] = useState(false);
    const [paidFilter, setPaidFilter] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchParams] = useSearchParams();
    
    // to be fetched from backend
    const eventTypeOptions = [{label: "Event Type", value: ""}, { label: "Offline", value: "1" }, { label: "Online", value: "2" }]; 

    // This will hold the list of events fetched from the backend
    const fetchEvents = useCallback(async () => {
        setEvents([{ id: 1, name: "Sample Event", 
            start_time: "2023-10-10T10:00:00Z", 
            location: "Location 1",
            price: 0,
            img: "https://tse1.mm.bing.net/th/id/OIP.lZcTQuv69wOV10v9JtAc2wHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"
        }]);
    },  []);

    const authQueryParams = useCallback(
        () => Promise.all([fetchEvents()]),
        [fetchEvents],
    );

    useAuthQuery(authQueryParams);


    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, eventTypeFilter]);

    useEffect(() => {
        const event_type = searchParams.get("event_type") || "";
        if (event_type && events.length > 0) {
            setEventTypeFilter(event_type);
        }
    }, [searchParams, events]);

    const handleViewEvent = (eventId: number) => {
        navigate(`/user/events/${eventId}`);
    };

    // to be done with backend filtering
    const handleFreeFilter = () => {
        setFreeFilter(!freeFilter);
        setPaidFilter(false);
    };

    // to be done with backend filtering
    const handlePaidFilter = () => {
        setPaidFilter(!paidFilter);
        setFreeFilter(false);
    };

    const handlePagination = () => {
        if (hasNextPage && events.length > 0) {
            setPage(page + 1);
        }
    };

    const handleShareEvent = (eventId: number) => {
        const url = `${window.location.origin}/user/events/${eventId}`;
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "event link copied to clipboard successfully",
        );
    };

    return (
        <Layout>
            <PageSeo
                title="Events - CU Portal"
                description="Discover amazing events happening on campus"
            />
            <Banner
                title="My Events"
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
                        <div className={styles.priceButtons}>
                            <button
                                    type="button"
                                    className={`${styles.priceButton} ${freeFilter ? styles.priceButtonActive : ""}`}
                                    onClick={() => {
                                        handleFreeFilter();
                                    }}
                                >
                                    Free
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.priceButton} ${paidFilter ? styles.priceButtonActive : ""}`}
                                    onClick={() => {
                                        handlePaidFilter();
                                    }}
                                >
                                    Paid
                                </button>
                        </div>
                    </div>
                </div>

                <div className={styles.eventsGrid}>
                    {events.map((event) => (
                        <Card
                            key={event.id}
                            title={event.name || ""}
                            img={event.img || ""}
                            badge={event.price !== undefined ? event.price === 0 ? "Free" : `$${event.price?.toFixed(2)}` : ""}
                            items={[
                                {
                                    icon: "calendar",
                                    label: "Date",
                                    value: formatDateTime(event.start_time),
                                },
                                {
                                    icon: "location",
                                    label: "Location",
                                    value: event.location || "N/A",
                                },
                            ]}
                            button="View Details"
                            buttonAction={() => handleViewEvent(event.id!)}
                            hasOptions
                            sharable
                            onShare={() => handleShareEvent(event.id!)}
                        />
                    ))}
                </div>

                {events.length === 0 && (
                    <NoContentSection icon="event" label="No events found" />
                )}

                <Pagination onReached={handlePagination} />
            </div>
        </Layout>
    );
};
