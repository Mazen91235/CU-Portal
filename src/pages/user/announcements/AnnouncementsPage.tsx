import { useState, useCallback, useEffect, useMemo } from "react";
import { buildRedirectUrl } from "../../../utils/Navigation";
import { useNavigate } from "react-router";
import { useLazyGetAnnouncementsQuery } from "../../../services/apis/user/AnnouncementAPIs";
import type { AnnouncementResponseDto } from "../../../types/dtos/AnnouncementDtos";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Card } from "../../../components/card/Card";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import {
    formatDate,
    formatDateTime,
    toIsoFormat,
} from "../../../utils/Formatter";
import { SelectFilter } from "../../../components/forms/SelectFilter";

import styles from "./AnnouncementsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";
import { useAppSelector } from "../../../services/redux/Hooks";

export const AnnouncementsPage = () => {
    const navigate = useNavigate();
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");
    const subjectFilter = getFilter("subject_id", "");
    const setSubjectFilter = getFilterSetter("subject_id");
    const subjects = useAppSelector((state) => state.user.user?.subjects ?? []);
    const dateFromFilter = getFilter("date_from", new Date().toLocaleDateString("en-CA"));
    const setDateFromFilter = getFilterSetter("date_from", true);
    const dateToFilter = getFilter("date_to", "");
    const setDateToFilter = getFilterSetter("date_to", true);
    const [announcements, setAnnouncements] = useState<
        AnnouncementResponseDto[]
    >([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [getAnnouncements, { isFetching }] = useLazyGetAnnouncementsQuery();

    const fetchAnnouncements = useCallback(async () => {
        try {
            if (!hasNextPage) return;
            const result = await getAnnouncements({
                data: {
                    query: searchQuery || undefined,
                    date_from: toIsoFormat(dateFromFilter),
                    date_to: toIsoFormat(dateToFilter),
                    subject_id: parseInt(subjectFilter) || undefined,
                },
                includes: ["subject"],
                order_by: ["date_nearest"],
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
            setHasNextPage(result.next_page || false);
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

    const authFetchAnnouncementsQuery = useCallback(
        () => fetchAnnouncements(),
        [fetchAnnouncements],
    );

    useAuthQuery(authFetchAnnouncementsQuery);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, subjectFilter, dateFromFilter, dateToFilter]);

    const handleViewAnnouncement = (announcementId: number) => {
        navigate(buildRedirectUrl(`/user/announcements/${announcementId}`));
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
                            setValue={setSearchQuery} value={searchQuery}
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
                            setValue={setDateFromFilter} // Set default date to today's date in "YYYY-MM-DD" format
                            value={dateFromFilter}
                        />
                        <DateFilter
                            placeholder="End Date"
                            setValue={setDateToFilter}
                            value={dateToFilter}
                            startDay={false}
                        />
                    </div>
                </div>

                <div className={styles.announcementsGrid}>
                    {announcements.map((announcement) => (
                        <Card
                            key={announcement.id}
                            title={announcement.title || ""}
                            badge={announcement.subject?.code || undefined}
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
