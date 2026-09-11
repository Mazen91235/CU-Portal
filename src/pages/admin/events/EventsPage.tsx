import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
    useLazyGetEventsQuery,
    useDeleteEventMutation,
} from "../../../services/apis/admin/EventAPIs";
import type { EventResponseDto } from "../../../types/dtos/EventDtos";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useAppSelector } from "../../../services/redux/Hooks";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { useLazyGetEventOrganizersQuery } from "../../../services/apis/admin/EventOrganizerAPIs";
import type { EventOrganizerResponseDto } from "../../../types/dtos/EventOrganizerDtos";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Card } from "../../../components/card/Card";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { formatDateTime } from "../../../utils/Formatter";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

import styles from "./EventsPage.module.css";

export const EventsPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);

    const [searchQuery, setSearchQuery] = useState("");
    const [eventTypeFilter, setEventTypeFilter] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [eventOrganizerFilter, setEventOrganizerFilter] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState(
        new Date().toLocaleDateString("en-CA"),
    );
    const [dateToFilter, setDateToFilter] = useState("");
    const [events, setEvents] = useState<EventResponseDto[]>([]);
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);
    const [eventOrganizers, setEventOrganizers] = useState<
        EventOrganizerResponseDto[]
    >([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<EventResponseDto | null>(
        null,
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [getEvents, { isFetching }] = useLazyGetEventsQuery();
    const [deleteEvent] = useDeleteEventMutation();
    const [getFaculties] = useLazyGetFacultiesQuery();
    const [getDepartments] = useLazyGetDepartmentsQuery();
    const [getYears] = useLazyGetYearsQuery();
    const [getEventOrganizers] = useLazyGetEventOrganizersQuery();

    const eventTypeOptions = useMemo(
        () => [
            { label: "Location Type", value: "" },
            { label: "Online", value: "Online" },
            { label: "Offline", value: "Offline" },
        ],
        [],
    );

    const fetchFaculties = useCallback(async () => {
        if (!user?.canAccessAll) return;

        try {
            const result = await getFaculties({ data: {} }).unwrap();
            setFaculties(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getFaculties, user?.canAccessAll]);

    const fetchDepartments = useCallback(async () => {
        if (!user?.canAccessAll) return;

        if (!facultyFilter) {
            setDepartments([]);
            return;
        }

        try {
            const result = await getDepartments({
                data: {
                    faculty_id: parseInt(facultyFilter),
                    study_type: undefined,
                },
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartments, facultyFilter, user?.canAccessAll]);

    const fetchYears = useCallback(async () => {
        if (!user?.canAccessAll) return;

        try {
            const result = await getYears({ data: {} }).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getYears, user?.canAccessAll]);

    const fetchEventOrganizers = useCallback(async () => {
        try {
            const result = await getEventOrganizers({ data: {} }).unwrap();
            setEventOrganizers(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getEventOrganizers]);

    const fetchEvents = useCallback(async () => {
        if (!hasNextPage || !user) return;

        try {
            const params = {
                query: searchQuery || undefined,
                location_type: (eventTypeFilter === "Online" ||
                eventTypeFilter === "Offline"
                    ? eventTypeFilter
                    : undefined) as "Online" | "Offline" | undefined,
                faculty_id:
                    user.canAccessAll && facultyFilter
                        ? parseInt(facultyFilter)
                        : undefined,
                department_id:
                    user.canAccessAll && departmentFilter
                        ? parseInt(departmentFilter)
                        : undefined,
                year_id:
                    user.canAccessAll && yearFilter
                        ? parseInt(yearFilter)
                        : undefined,
                event_organizer_id: eventOrganizerFilter
                    ? parseInt(eventOrganizerFilter)
                    : undefined,
                start_date_from: dateFromFilter || undefined,
                start_date_to: dateToFilter || undefined,
            };

            const result = await getEvents({
                data: params,
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
                const filteredPrev = prev.filter(
                    (event) =>
                        !result.data?.some(
                            (newEvent) => newEvent.id === event.id,
                        ),
                );

                if (page === 1) return result.data || [];
                return [...filteredPrev, ...(result.data || [])];
            });

            setHasNextPage(result.next_page || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getEvents,
        hasNextPage,
        user,
        searchQuery,
        eventTypeFilter,
        facultyFilter,
        departmentFilter,
        yearFilter,
        eventOrganizerFilter,
        dateFromFilter,
        dateToFilter,
        page,
    ]);

    const authQueryParams = useCallback(
        () =>
            Promise.all([
                fetchEvents(),
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
                fetchEventOrganizers(),
            ]),
        [
            fetchEvents,
            fetchFaculties,
            fetchDepartments,
            fetchYears,
            fetchEventOrganizers,
        ],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [
        searchQuery,
        eventTypeFilter,
        facultyFilter,
        departmentFilter,
        yearFilter,
        eventOrganizerFilter,
        dateFromFilter,
        dateToFilter,
    ]);

    useEffect(() => {
        setDepartmentFilter("");
    }, [facultyFilter]);

    const handleViewEvent = (eventId: number) => {
        navigate(`/admin/events/${eventId}`);
    };

    const handleEditEvent = (eventId: number) => {
        navigate(`/admin/events/edit/${eventId}`);
    };

    const handleDeleteClick = (event: EventResponseDto) => {
        setSelectedEvent(event);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedEvent?.id) return;

        try {
            await deleteEvent({ event_id: selectedEvent.id }).unwrap();
            showToast("success", "Success", "Event deleted successfully.");
            setIsDeleteModalOpen(false);
            setSelectedEvent(null);
            setPage(1);
            setHasNextPage(true);
            await fetchEvents();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleShareEvent = (eventId: number) => {
        copyToClipboard(`${window.location.origin}/admin/events/${eventId}`);
        showToast("success", "Success", "Event link copied to clipboard.");
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && events.length > 0) {
            setPage((current) => current + 1);
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
            { value: "", label: "Academic Year" },
            ...years.map((year) => ({
                value: year.id?.toString() || "",
                label: year.year?.toString() || "",
            })),
        ],
        [years],
    );

    const eventOrganizerOptions = useMemo(
        () => [
            { value: "", label: "Event Organizer" },
            ...eventOrganizers.map((organizer) => ({
                value: organizer.id?.toString() || "",
                label: organizer.name || "",
            })),
        ],
        [eventOrganizers],
    );

    return (
        <Layout>
            <PageSeo
                title="Events Management - CU Portal"
                description="Manage all university events"
            />
            <Banner
                title="Events Management"
                description="Manage all university events"
                button="Add New Event"
                buttonAction={() => navigate("/admin/events/create")}
            />

            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search events..."
                            setValue={setSearchQuery}
                        />
                    </div>

                    <div className={styles.filtersRow}>
                        {user?.canAccessAll && (
                            <>
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
                            </>
                        )}
                        <SelectFilter
                            options={eventOrganizerOptions}
                            setValue={setEventOrganizerFilter}
                        />
                        <SelectFilter
                            options={eventTypeOptions}
                            setValue={setEventTypeFilter}
                        />
                        <DateFilter
                            placeholder="Date From"
                            setValue={setDateFromFilter}
                            defaultDate={dateFromFilter}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateToFilter}
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
                                event.department && event.year
                                    ? `${event.department?.code || ""} ${event.year?.year || ""}`.trim()
                                    : undefined
                            }
                            items={[
                                ...(event.faculty
                                    ? [
                                          {
                                              icon: "building",
                                              label: "Faculty",
                                              value:
                                                  event.faculty.name || "N/A",
                                          },
                                      ]
                                    : []),
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
                            button="View Event"
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

                {events.length === 0 && !isFetching && (
                    <NoContentSection icon="calendar" label="No events found" />
                )}

                <Pagination onReached={handlePagination} />
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                confirmText="Delete"
                title="Delete Event"
                message={`Are you sure you want to delete "${selectedEvent?.title}"? This action cannot be undone.`}
                colorType="red"
            />
        </Layout>
    );
};
