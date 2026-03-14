import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    useLazyGetAnnouncementsQuery,
    useDeleteAnnouncementMutation,
} from "../../../services/apis/admin/AnnouncementAPIs";
import { useLazySearchFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazySearchDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazySearchYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { useLazySearchCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import type { Announcement } from "../../../types/entities/Announcement";
import type { Faculty } from "../../../types/entities/Faculty";
import type { Department } from "../../../types/entities/Department";
import type { Year } from "../../../types/entities/Year";
import type { Subject } from "../../../types/entities/Subject";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Card } from "../../../components/card/Card";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { formatDate, formatDateTime } from "../../../utils/Formatter";
import { useAppSelector } from "../../../services/redux/Hooks";

import styles from "./AnnouncementsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";

export const AnnouncementsPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<Announcement | null>(null);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    const [searchCourses] = useLazySearchCoursesQuery();
    const [getAnnouncements, { isFetching }] = useLazyGetAnnouncementsQuery();
    const [deleteAnnouncement] = useDeleteAnnouncementMutation();

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

    const fetchSubjects = useCallback(async () => {
        try {
            if (!user) return;
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};
            if (facultyFilter) params.faculty_id = parseInt(facultyFilter);
            if (departmentFilter)
                params.department_id = parseInt(departmentFilter);
            if (yearFilter) params.year_id = parseInt(yearFilter);

            if (!user.canAccessAll) {
                params.faculty_id = user.faculty?.id;
                params.department_id = user.department?.id;
                params.year_id = user.year?.id;
            }

            if (Object.keys(params).length < 3) {
                setSubjects([]);
                return;
            }

            const result = await searchCourses(params).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchCourses, facultyFilter, departmentFilter, yearFilter, user]);

    const fetchAnnouncements = useCallback(async () => {
        try {
            if (!hasNextPage || !user) return;
            const params = {
                query: searchQuery || undefined,
                faculty_id: facultyFilter ? parseInt(facultyFilter) : undefined,
                department_id: departmentFilter
                    ? parseInt(departmentFilter)
                    : undefined,
                year_id: yearFilter ? parseInt(yearFilter) : undefined,
                subject_id: subjectFilter ? parseInt(subjectFilter) : undefined,
                start_date: dateFromFilter || undefined,
                end_date: dateToFilter || undefined,
                page,
            };
            if (!user.canAccessAll) {
                params.faculty_id = undefined;
                params.department_id = undefined;
                params.year_id = undefined;
            }
            const result = await getAnnouncements(params).unwrap();
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
        facultyFilter,
        departmentFilter,
        yearFilter,
        subjectFilter,
        searchQuery,
        dateFromFilter,
        dateToFilter,
        page,
        hasNextPage,
        user,
    ]);

    const authQueryParams = useCallback(
        () =>
            Promise.all([
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
                fetchSubjects(),
                fetchAnnouncements(),
            ]),
        [
            fetchFaculties,
            fetchDepartments,
            fetchYears,
            fetchSubjects,
            fetchAnnouncements,
        ],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [
        facultyFilter,
        departmentFilter,
        yearFilter,
        subjectFilter,
        searchQuery,
        dateFromFilter,
        dateToFilter,
    ]);

    const handleAddAnnouncement = () => {
        navigate("/admin/announcements/create");
    };

    const handleShareAnnouncement = (announcementId: number) => {
        const url = `${window.location.origin}/admin/announcements/${announcementId}`;
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "Announcement link copied to clipboard successfully",
        );
    };

    const handleEditAnnouncement = (announcementId: number) => {
        navigate(`/admin/announcements/edit/${announcementId}`);
    };

    const handleDeleteClick = (announcement: Announcement) => {
        setSelectedAnnouncement(announcement);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedAnnouncement?.id) return;

        try {
            await deleteAnnouncement({
                announcement_id: selectedAnnouncement.id,
            }).unwrap();
            showToast(
                "success",
                "Success",
                "Announcement deleted successfully",
            );
            setIsDeleteModalOpen(false);
            setSelectedAnnouncement(null);
            setPage(1);
            setHasNextPage(true);
            await fetchAnnouncements();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleViewAnnouncement = (announcementId: number) => {
        navigate(`/admin/announcements/${announcementId}`);
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && announcements.length > 0) {
            setPage(page + 1);
        }
    };

    useEffect(() => {
        setDepartmentFilter("");
    }, [facultyFilter]);

    useEffect(() => {
        setSubjectFilter("");
    }, [departmentFilter, yearFilter]);

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
            ...departments.map((dept) => ({
                value: dept.id?.toString() || "",
                label: dept.name || "",
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

    const subjectOptions = useMemo(
        () => [
            { value: "", label: "Subject" },
            ...subjects.map((subject) => ({
                value: subject.id?.toString() || "",
                label: subject.name || "",
            })),
        ],
        [subjects],
    );

    return (
        <Layout>
            <PageSeo
                title="Announcements Management - CU Portal"
                description="Manage all university announcements"
            />
            <Banner
                title="Announcements Management"
                description="Manage all university announcements"
                button="Add New Announcement"
                buttonAction={handleAddAnnouncement}
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
                            options={subjectOptions}
                            setValue={setSubjectFilter}
                        />
                        <DateFilter
                            placeholder="Start Date"
                            setValue={setDateFromFilter}
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
                            badge={`${announcement.department?.code} ${announcement.year?.year}`}
                            items={[
                                {
                                    icon: "building",
                                    label: "Faculty",
                                    value: announcement.faculty?.name || "N/A",
                                },
                                {
                                    icon: "user",
                                    label: "Author",
                                    value: announcement.author?.name || "N/A",
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
                            sharable
                            editable
                            deletable
                            hasOptions
                            onShare={() =>
                                handleShareAnnouncement(announcement.id!)
                            }
                            onEdit={() =>
                                handleEditAnnouncement(announcement.id!)
                            }
                            onDelete={() => handleDeleteClick(announcement)}
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Announcement"
                message={`Are you sure you want to delete "${selectedAnnouncement?.title}"? This action cannot be undone.`}
                confirmText="Delete"
                colorType="red"
            />
        </Layout>
    );
};
