import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
    useLazyGetCoursesQuery,
    useDeleteCourseMutation,
} from "../../../services/apis/admin/CourseAPIs";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Card } from "../../../components/card/Card";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { Layout } from "../../../components/layout/Layout";
import { Pagination } from "../../../components/pagination/Pagination";
import { useAppSelector } from "../../../services/redux/Hooks";

import styles from "./CoursesPage.module.css";

export const CoursesPage = () => {
    const navigate = useNavigate();
    const {
        facultyId: routeFacultyId,
        departmentId: routeDepartmentId,
        yearId: routeYearId,
    } = useParams();
    const facultyFilter = routeFacultyId ?? "";
    const departmentFilter = routeDepartmentId ?? "";
    const yearFilter = routeYearId ?? "";
    const user = useAppSelector((state) => state.user.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [courses, setCourses] = useState<SubjectResponseDto[]>([]);
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] =
        useState<SubjectResponseDto | null>(null);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [searchFaculties] = useLazyGetFacultiesQuery();
    const [searchDepartments] = useLazyGetDepartmentsQuery();
    const [searchYears] = useLazyGetYearsQuery();
    const [getCourses, { isFetching }] = useLazyGetCoursesQuery();
    const [deleteCourse] = useDeleteCourseMutation();

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

    const fetchCourses = useCallback(async () => {
        try {
            if (!hasNextPage || !user) return;
            if (!facultyFilter || !departmentFilter || !yearFilter) {
                setCourses([]);
                return;
            }
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
                query: string;
            } = {
                faculty_id: parseInt(facultyFilter),
                department_id: parseInt(departmentFilter),
                year_id: parseInt(yearFilter),
                query: searchQuery || "",
            };
            if (!user.canAccessAll) {
                params.faculty_id = user.faculty?.id ?? undefined;
                params.department_id = user.department?.id ?? undefined;
                params.year_id = user.year?.id ?? undefined;
            }
            const result = await getCourses({
                data: params,
                includes: [
                    "faculty",
                    "department",
                    "year",
                    "user_subject_links.user",
                ],
                page,
            }).unwrap();
            setCourses((prev) => {
                const filteredPrev = prev.filter(
                    (course) =>
                        !result.data?.some(
                            (newCourse) => newCourse.id === course.id,
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
        getCourses,
        facultyFilter,
        departmentFilter,
        yearFilter,
        searchQuery,
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
                fetchCourses(),
            ]),
        [fetchFaculties, fetchDepartments, fetchYears, fetchCourses],
    );

    useAuthQuery(authQueryParams);

    const buildCoursesPath = useCallback(
        (
            facultyValue?: string | number | null,
            departmentValue?: string | number | null,
            yearValue?: string | number | null,
        ) => {
            if (!facultyValue) return "/admin/courses";
            if (!departmentValue)
                return `/admin/courses/filter/${facultyValue}`;
            if (!yearValue)
                return `/admin/courses/filter/${facultyValue}/${departmentValue}`;
            return `/admin/courses/filter/${facultyValue}/${departmentValue}/${yearValue}`;
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
                buildCoursesPath(ownFacultyId, ownDepartmentId, ownYearId),
                { replace: true },
            );
        }
    }, [
        user,
        facultyFilter,
        departmentFilter,
        yearFilter,
        navigate,
        buildCoursesPath,
    ]);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [facultyFilter, departmentFilter, yearFilter, searchQuery]);

    const handleAddCourse = () => {
        navigate("/admin/courses/create");
    };

    const handleEditCourse = (courseId: number) => {
        navigate(`/admin/courses/edit/${courseId}`);
    };

    const handleDeleteClick = (course: SubjectResponseDto) => {
        setSelectedCourse(course);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedCourse?.id) return;

        try {
            await deleteCourse({
                course_id: selectedCourse.id,
            }).unwrap();
            showToast("success", "Success", "Course deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedCourse(null);
            setPage(1);
            setHasNextPage(true);
            await fetchCourses();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleViewCourse = (courseId: number) => {
        navigate(`/admin/courses/${courseId}`);
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && courses.length > 0) {
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

    return (
        <Layout>
            <PageSeo
                title="Courses Management - CU Portal"
                description="Manage all university courses and schedules"
            />
            <Banner
                title="Courses Management"
                description="Manage all university courses and schedules"
                button="Add New Course"
                buttonAction={handleAddCourse}
            />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search by course name or code"
                            setValue={setSearchQuery}
                        />
                    </div>
                    {user?.canAccessAll && (
                        <div className={styles.filtersRow}>
                            <SelectFilter
                                options={facultyOptions}
                                setValue={(value) =>
                                    navigate(buildCoursesPath(value))
                                }
                                value={facultyFilter}
                                placeholder="Select Faculty"
                            />
                            <SelectFilter
                                options={departmentOptions}
                                setValue={(value) =>
                                    navigate(
                                        buildCoursesPath(
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
                                        buildCoursesPath(
                                            facultyFilter,
                                            departmentFilter,
                                            value,
                                        ),
                                    )
                                }
                                value={yearFilter}
                                disabled={!facultyFilter || !departmentFilter}
                                placeholder="Select Year"
                            />
                        </div>
                    )}
                </div>

                <div className={styles.courseGrid}>
                    {courses.map((course) => (
                        <Card
                            key={course.id}
                            title={course.name || ""}
                            badge={course.code || ""}
                            secondaryBadge={`${course.credits || 0} Credits`}
                            items={[
                                {
                                    icon: "subject",
                                    label: "Faculty",
                                    value: course.faculty?.name || "N/A",
                                },
                                {
                                    icon: "subject",
                                    label: "Department",
                                    value: course.department?.name || "N/A",
                                },
                                {
                                    icon: "calendar",
                                    label: "Year",
                                    value:
                                        course.year?.year?.toString() || "N/A",
                                },
                                {
                                    icon: "user",
                                    label: "Students",
                                    value:
                                        course.users?.length?.toString() || "0",
                                },
                            ]}
                            button="View Course"
                            buttonAction={() => handleViewCourse(course.id!)}
                            editable
                            deletable
                            hasOptions
                            onEdit={() => handleEditCourse(course.id!)}
                            onDelete={() => handleDeleteClick(course)}
                        />
                    ))}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Course"
                message={`Are you sure you want to delete "${selectedCourse?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                colorType="red"
            />
            <Pagination onReached={handlePagination} />
        </Layout>
    );
};
