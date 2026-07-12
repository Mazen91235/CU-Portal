import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useLazyGetAnnouncementsQuery } from "../../../services/apis/user/AnnouncementAPIs";
import type { Announcement } from "../../../types/entities/Announcement";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Card } from "../../../components/card/Card";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { formatDate, formatDateTime } from "../../../utils/Formatter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import type { Subject } from "../../../types/entities/Subject";

import styles from "./AnnouncementsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

export const AnnouncementsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [dateFromFilter, setDateFromFilter] = useState(new Date().toLocaleDateString("en-CA")); // Set default date to today's date in "YYYY-MM-DD" format
    const [dateToFilter, setDateToFilter] = useState("");
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchParams] = useSearchParams();
    const [getSubjects] = useLazyGetEnrolledCoursesQuery();
    const [getAnnouncements, { isFetching }] = useLazyGetAnnouncementsQuery();

    const fetchSubjects = useCallback(async () => {
        try {
            const result = await getSubjects().unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getSubjects]);

    const fetchAnnouncements = useCallback(async () => {
        try {
            if (!hasNextPage) return;
            const result = await getAnnouncements({
                query: searchQuery || undefined,
                start_date: dateFromFilter || undefined,
                end_date: dateToFilter || undefined,
                subject_id: parseInt(subjectFilter) || undefined,
                page,
            }).unwrap();
            setAnnouncements((prev) => {
                const filteredPrev = prev.filter(
                    (announcement) =>
                        !result.data?.some(
                            (newAnnouncement) =>
                                newAnnouncement.id === announcement.id,
                        ),
                );
                if (page == 1) return result.data || [];
                return [...filteredPrev, ...(result.data || [])];
            });
            setHasNextPage(result.next || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getAnnouncements,
        searchQuery,
        subjectFilter,
        dateFromFilter,
        dateToFilter,
        page,
        hasNextPage,
    ]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchSubjects(), fetchAnnouncements()]),
        [fetchSubjects, fetchAnnouncements],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, subjectFilter, dateFromFilter, dateToFilter]);

    useEffect(() => {
        const subject_id = searchParams.get("subject_id") || "";
        if (subject_id && subjects.length > 0) {
            setSubjectFilter(subject_id);
        }
    }, [searchParams, subjects]);

    const handleViewAnnouncement = (announcementId: number) => {
        navigate(`/user/announcements/${announcementId}`);
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && announcements.length > 0) {
            setPage(page + 1);
        }
    };

    const handleShareAnnouncement = (announcementId: number) => {
        const url = `${window.location.origin}/user/announcements/${announcementId}`;
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "Announcement link copied to clipboard successfully",
        );
    };

    const subjectOptions = useMemo(() => {
        const options = [{ label: "All Subjects", value: "" }];
        options.push(
            ...subjects.map((subject) => ({
                label: subject.name || "N/A",
                value: subject.id?.toString() || "",
            })),
        );
        return options;
    }, [subjects]);

    return (
        <Layout>
            <PageSeo
                title="Announcements - CU Portal"
                description="View all university announcements"
            />
            <Banner
                title="Announcements"
                description="View all university announcements"
            />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search announcements..."
                            setValue={setSearchQuery}
                        />
                    </div>
                    <div className={styles.filtersRow}>
                        <SelectFilter
                            value={subjectFilter}
                            options={subjectOptions}
                            setValue={setSubjectFilter}
                        />
                        <DateFilter
                            placeholder="Start Date"
                            setValue={setDateFromFilter}
                            defaultDate={new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric"})} // Set default date to today's date in "MMM DD, YYYY" format
                        />
                        <DateFilter
                            placeholder="End Date"
                            setValue={setDateToFilter}
                        />
                    </div>
                </div>

                <div className={styles.announcementsGrid}>
                    {announcements.map((announcement) => (
                        <Card
                            key={announcement.id}
                            title={announcement.title || ""}
                            badge={announcement.subject?.code}
                            items={[
                                {
                                    icon: "subject",
                                    label: "Subject",
                                    value: announcement.subject?.name || "N/A",
                                },
                                {
                                    icon: "calendar",
                                    label: "Date",
                                    value:
                                        formatDateTime(announcement.date) ||
                                        "N/A",
                                },
                                {
                                    icon: "calendar",
                                    label: "Created At",
                                    value:
                                        formatDate(announcement.created_at) ||
                                        "N/A",
                                },
                            ]}
                            button="View Announcement"
                            buttonAction={() =>
                                handleViewAnnouncement(announcement.id!)
                            }
                            hasOptions
                            sharable
                            onShare={() =>
                                handleShareAnnouncement(announcement.id!)
                            }
                        />
                    ))}
                </div>

                {announcements.length === 0 && !isFetching && (
                    <NoContentSection
                        icon="bullhorn"
                        label="No announcements found"
                    />
                )}

                <Pagination onReached={handlePagination} />
            </div>
        </Layout>
    );
};
