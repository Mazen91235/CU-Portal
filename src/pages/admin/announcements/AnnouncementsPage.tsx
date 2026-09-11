import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
    useLazyGetAnnouncementsQuery,
    useDeleteAnnouncementMutation,
} from "../../../services/apis/admin/AnnouncementAPIs";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { useLazyGetCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import type { AnnouncementResponseDto } from "../../../types/dtos/AnnouncementDtos";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
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
    const {
        facultyId: routeFacultyId,
        departmentId: routeDepartmentId,
        yearId: routeYearId,
        subjectId: routeSubjectId,
    } = useParams();
    const facultyFilter = routeFacultyId ?? "";
    const departmentFilter = routeDepartmentId ?? "";
    const yearFilter = routeYearId ?? "";
    const subjectFilter = routeSubjectId ?? "";
    const user = useAppSelector((state) => state.user.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState(
        new Date().toLocaleDateString("en-CA"),
    ); // Set default date to today's date in "YYYY-MM-DD" format
    const [dateToFilter, setDateToFilter] = useState("");
    const [announcements, setAnnouncements] = useState<
        AnnouncementResponseDto[]
    >([]);
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] =
        useState<AnnouncementResponseDto | null>(null);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [searchFaculties] = useLazyGetFacultiesQuery();
    const [searchDepartments] = useLazyGetDepartmentsQuery();
    const [searchYears] = useLazyGetYearsQuery();
    const [searchCourses] = useLazyGetCoursesQuery();
    const [getAnnouncements, { isFetching }] = useLazyGetAnnouncementsQuery();
    const [deleteAnnouncement] = useDeleteAnnouncementMutation();

    const fetchFaculties = useCallback(async () => {
        try {
            const result = await searchFaculties({ data: {} }).unwrap();
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
                data: {
                    faculty_id: parseInt(facultyFilter) || undefined,
                    study_type: undefined,
                },
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, facultyFilter]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({ data: {} }).unwrap();
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
                params.faculty_id = user.faculty?.id ?? undefined;
                params.department_id = user.department?.id ?? undefined;
                params.year_id = user.year?.id ?? undefined;
            }

            if (Object.keys(params).length < 3) {
                setSubjects([]);
                return;
            }

            const result = await searchCourses({ data: params }).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchCourses, facultyFilter, departmentFilter, yearFilter, user]);

    const fetchAnnouncements = useCallback(async () => {
        try {
            if (!hasNextPage || !user) return;
            if (!facultyFilter || !departmentFilter || !yearFilter) {
                setAnnouncements([]);
                return;
            }
            const params: {
                query?: string;
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
                subject_id?: number;
                date_from?: Date;
                date_to?: Date;
            } = {
                query: searchQuery || undefined,
                faculty_id: parseInt(facultyFilter),
                department_id: parseInt(departmentFilter),
                year_id: parseInt(yearFilter),
                subject_id: subjectFilter ? parseInt(subjectFilter) : undefined,
                date_from: dateFromFilter
                    ? new Date(dateFromFilter)
                    : undefined,
                date_to: dateToFilter ? new Date(dateToFilter) : undefined,
            };
            if (!user.canAccessAll) {
                params.faculty_id = user.faculty?.id ?? undefined;
                params.department_id = user.department?.id ?? undefined;
                params.year_id = user.year?.id ?? undefined;
            }
            const result = await getAnnouncements({
                data: params,
                includes: ["faculty", "department", "year", "subject"],
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

    const buildAnnouncementsPath = useCallback(
        (
            facultyValue?: string | number | null,
            departmentValue?: string | number | null,
            yearValue?: string | number | null,
            subjectValue?: string | number | null,
        ) => {
            if (!facultyValue) return "/admin/announcements";
            if (!departmentValue)
                return `/admin/announcements/filter/${facultyValue}`;
            if (!yearValue)
                return `/admin/announcements/filter/${facultyValue}/${departmentValue}`;
            if (!subjectValue)
                return `/admin/announcements/filter/${facultyValue}/${departmentValue}/${yearValue}`;
            return `/admin/announcements/filter/${facultyValue}/${departmentValue}/${yearValue}/${subjectValue}`;
        },
        [],
    );

    useEffect(() => {
        if (!user || user.canAccessAll) return;
        const ownFacultyId = user.faculty?.id?.toString() ?? "";
        const ownDepartmentId = user.department?.id?.toString() ?? "";
        const ownYearId = user.year?.id?.toString() ?? "";
        if (
            facultyFilter !== ownFacultyId ||
            departmentFilter !== ownDepartmentId ||
            yearFilter !== ownYearId
        ) {
            navigate(
                buildAnnouncementsPath(
                    ownFacultyId,
                    ownDepartmentId,
                    ownYearId,
                    null,
                ),
                { replace: true },
            );
        }
    }, [
        user,
        facultyFilter,
        departmentFilter,
        yearFilter,
        navigate,
        buildAnnouncementsPath,
    ]);

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
        const url = `${window.location.origin}/user/announcements/${announcementId}`;
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

    const handleDeleteClick = (announcement: AnnouncementResponseDto) => {
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

    const facultyOptions = useMemo(
        () =>
            faculties.map((faculty) => ({
                value: faculty.id?.toString() || "",
                label: faculty.name || "",
            })),
        [faculties],
    );

    const departmentOptions = useMemo(
        () =>
            departments.map((dept) => ({
                value: dept.id?.toString() || "",
                label: dept.name || "",
            })),
        [departments],
    );

    const yearOptions = useMemo(
        () =>
            years.map((year) => ({
                value: year.id?.toString() || "",
                label: year.year?.toString() || "",
            })),
        [years],
    );

    const subjectOptions = useMemo(
        () => [
            { value: "", label: "All Subjects" },
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
                                    setValue={(value) =>
                                        navigate(
                                            buildAnnouncementsPath(value),
                                        )
                                    }
                                    value={facultyFilter}
                                    placeholder="Select Faculty"
                                />
                                <SelectFilter
                                    options={departmentOptions}
                                    setValue={(value) =>
                                        navigate(
                                            buildAnnouncementsPath(
                                                facultyFilter,
                                                value,
                                            ),
                                        )
                                    }
                                    value={departmentFilter}
                                    disabled={!facultyFilter}
                                    placeholder="Select Department"
                                />
                                <SelectFilter
                                    options={yearOptions}
                                    setValue={(value) =>
                                        navigate(
                                            buildAnnouncementsPath(
                                                facultyFilter,
                                                departmentFilter,
                                                value,
                                            ),
                                        )
                                    }
                                    value={yearFilter}
                                    disabled={
                                        !facultyFilter || !departmentFilter
                                    }
                                    placeholder="Select Year"
                                />
                            </>
                        )}
                        <SelectFilter
                            options={subjectOptions}
                            setValue={(value) =>
                                navigate(
                                    buildAnnouncementsPath(
                                        facultyFilter,
                                        departmentFilter,
                                        yearFilter,
                                        value,
                                    ),
                                )
                            }
                            value={subjectFilter}
                            disabled={
                                !facultyFilter ||
                                !departmentFilter ||
                                !yearFilter
                            }
                        />
                        <DateFilter
                            placeholder="Start Date"
                            setValue={setDateFromFilter}
                            defaultDate={dateFromFilter} // Set default date to today's date in "YYYY-MM-DD" format
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
