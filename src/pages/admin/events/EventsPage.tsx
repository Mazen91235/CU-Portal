import { useState, useCallback, useEffect, useMemo } from "react";
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
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { formatDateTime } from "../../../utils/Formatter";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { useLazySearchFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazySearchDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazySearchYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import type { Year } from "../../../types/entities/Year";
import type { Department } from "../../../types/entities/Department";
import type { Faculty } from "../../../types/entities/Faculty";

import styles from "./EventsPage.module.css";

export const EventsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [eventTypeFilter, setEventTypeFilter] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [freeFilter, setFreeFilter] = useState(false);
    const [paidFilter, setPaidFilter] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchParams] = useSearchParams();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);

    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    
    // to be fetched from backend if required
    const eventTypeOptions = [{ label: "Event Type", value: "" }, { label: "Online", value: "1" }, { label: "Offline", value: "2" }]; 
    
    const fetchFaculties = useCallback(async () => {
            try {
                const result = await searchFaculties({}).unwrap();
                setFaculties(result.data || []);
            } catch (error) {
                handlePopupErrors(error);
            }
        }, [searchFaculties]);
    
    const fetchDepartments = useCallback(async () => {
        try {
            if (!facultyFilter) {
                setDepartments([]);
                return;
            }
            const result = await searchDepartments({
                faculty_id: parseInt(facultyFilter) || undefined,
                study_type: "",
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, facultyFilter]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({}).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchYears]);


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
        () => Promise.all([
            fetchEvents(),
            fetchFaculties(),
            fetchDepartments(),
            fetchYears(),
        ]),
        [fetchEvents, fetchFaculties, fetchDepartments, fetchYears],
    );

    useAuthQuery(authQueryParams);


    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, eventTypeFilter, freeFilter, paidFilter]);
    
    useEffect(() => {
        const event_type = searchParams.get("event_type") || "";
        if (event_type) {
            setEventTypeFilter(event_type);
        }
    }, [searchParams, events]);

    const handleViewEvent = (eventId: number) => {
        navigate(`/admin/events/${eventId}`);
    };

    const handleEditEvent = (eventId: number) => {
        navigate(`/admin/events/edit/${eventId}`);
    }

    const handleDeleteClick = (event: Event) => {
        setSelectedEvent(event);
        setIsDeleteModalOpen(true);
    }

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        // Call the API to delete the event
        setIsDeleteModalOpen(false);
        showToast("success", "Success", `Event "${selectedEvent.name}" deleted successfully.`);
        fetchEvents();
    };
    
    const handleShareEvent = (eventId: number) => {
        const url = `${window.location.origin}/admin/events/${eventId}`;
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "event link copied to clipboard successfully",
        );
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

    const facultyOptions = useMemo(
        () => [
            { value: "", label: "Faculty" },
            ...faculties.map((faculty) => ({
                value: faculty.id?.toString() || "",
                label: faculty.name || "",
            })),
        ],
        [faculties],
    );

    const departmentOptions = useMemo(
        () => [
            { value: "", label: "Department" },
            ...departments.map((department) => ({
                value: department.id?.toString() || "",
                label: department.name || "",
            })),
        ],
        [departments],
    );

    const yearOptions = useMemo(
        () => [
            { value: "", label: "Year" },
            ...years.map((year) => ({
                value: year.id?.toString() || "",
                label: year.year?.toString() || "",
            })),
        ],
        [years],
    );

    return (
        <Layout>
            <PageSeo
                title="Events - CU Portal"
                description="Discover amazing events happening on campus"
            />
            <Banner
                title="Events"
                description="Discover amazing events happening on campus"
                button="Add Event"
                buttonAction={()=> {navigate("/admin/events/create")}}
            />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.search}>
                        <Search
                            placeholder="Search events..."
                            setValue={setSearchQuery}
                        />
                    </div>
                    <div className={styles.filtersRow}>
                        <SelectFilter 
                            options={facultyOptions}
                            setValue={setFacultyFilter}
                        />
                        <SelectFilter 
                            options={departmentOptions}
                            setValue={setDepartmentFilter}
                        />
                        <SelectFilter 
                            options={yearOptions}
                            setValue={setYearFilter}
                        />
                        <div className={styles.priceFilters}>
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
                            editable
                            deletable
                            onShare={() => handleShareEvent(event.id!)}
                            onEdit={() => handleEditEvent(event.id!)}
                            onDelete={() => handleDeleteClick(event)}
                        />
                    ))}
                </div>

                {events.length === 0 && (
                    <NoContentSection icon="event" label="No events found" />
                )}

                <Pagination onReached={handlePagination} />
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteEvent}
                confirmText="Delete"
                title="Delete Event"
                message={`Are you sure you want to delete "${selectedEvent?.name}"? This action cannot be undone.`}
                colorType="red"
            />
        </Layout>
    );
};
