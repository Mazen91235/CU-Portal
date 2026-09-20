import { useCallback, useEffect, useMemo, useState } from "react";
import { PageSeo } from "../../../components/PageSeo";
import { Card } from "../../../components/card/Card";
import {
    useLazyGetAvailableCoursesQuery,
    useLazyGetEnrolledCoursesQuery,
    useRegisterCourseMutation,
    useUnregisterCourseMutation,
} from "../../../services/apis/user/CourseAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/user/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/user/YearAPIs";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { Layout } from "../../../components/layout/Layout";
import IconComponent from "../../../components/IconComponent";
import { Search } from "../../../components/forms/Search";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { useAppSelector } from "../../../services/redux/Hooks";

import styles from "./RegisteredCourses.module.css";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { showToast } from "../../../utils/ToastsManager";

export const RegisteredCourses = () => {
    const user = useAppSelector((state) => state.user.user);

    const [getEnrolledCourses] = useLazyGetEnrolledCoursesQuery();
    const [getAvailableCourses] = useLazyGetAvailableCoursesQuery();
    const [registerCourse] = useRegisterCourseMutation();
    const [unRegisterCourse] = useUnregisterCourseMutation();
    const [getDepartments] = useLazyGetDepartmentsQuery();
    const [getYears] = useLazyGetYearsQuery();

    const [registeredCourses, setRegisteredCourses] = useState<
        SubjectResponseDto[]
    >([]);
    const [availableCourses, setAvailableCourses] = useState<
        SubjectResponseDto[]
    >([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");
    const departmentFilter = getFilter("department_id", "");
    const setDepartmentFilter = getFilterSetter("department_id");
    const yearFilter = getFilter("year_id", "");
    const setYearFilter = getFilterSetter("year_id");
    const [selectedCourse, setSelectedCourse] =
        useState<SubjectResponseDto | null>(null);
    const [action, setAction] = useState<"register" | "unregister" | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchEnrolledCourses = useCallback(async () => {
        try {
            const response = await getEnrolledCourses().unwrap();
            setRegisteredCourses(response.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getEnrolledCourses]);

    const fetchAvailableCourses = useCallback(async () => {
        if (!departmentFilter || !yearFilter) {
            setAvailableCourses([]);
            return;
        }

        try {
            const response = await getAvailableCourses({
                data: {
                    department_id: Number(departmentFilter),
                    year_id: Number(yearFilter),
                    query: searchQuery || undefined,
                },
            }).unwrap();

            setAvailableCourses(response.data || []);
        } catch (error) {
            handlePopupErrors(error);
            setAvailableCourses([]);
        }
    }, [departmentFilter, yearFilter, searchQuery, getAvailableCourses]);

    const showCourseFilterPrompt = !departmentFilter || !yearFilter;

    const fetchDepartments = useCallback(async () => {
        try {
            if (!user?.faculty?.id || !user.study_type) {
                setDepartments([]);
                return;
            }

            const response = await getDepartments({
                data: {
                    faculty_id: user.faculty.id,
                    study_type: user.study_type,
                },
            }).unwrap();

            setDepartments(response.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartments, user]);

    const fetchYears = useCallback(async () => {
        try {
            const response = await getYears({ data: {} }).unwrap();
            setYears(response.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getYears]);

    const authDepartmentsQuery = useCallback(() => fetchDepartments(), [fetchDepartments]);
    const authYearsQuery = useCallback(() => fetchYears(), [fetchYears]);
    const authCoursesQuery = useCallback(
        () => Promise.all([fetchEnrolledCourses(), fetchAvailableCourses()]),
        [fetchEnrolledCourses, fetchAvailableCourses],
    );

    useAuthQuery(authDepartmentsQuery);
    useAuthQuery(authYearsQuery);
    useAuthQuery(authCoursesQuery);

    const generalDepartment = useMemo(
        () =>
            departments.find((department) =>
                department.name?.toLowerCase().includes("general"),
            ),
        [departments],
    );

    const showDepartmentFilter = Boolean(
        generalDepartment && user?.department?.id,
    );

    const departmentOptions = useMemo(() => {
        if (!user?.department?.id) return [];

        const options = [
            {
                value: user.department.id.toString(),
                label: user.department.name || "My Department",
            },
        ];

        if (
            generalDepartment?.id &&
            generalDepartment.id !== user.department.id
        ) {
            options.push({
                value: generalDepartment.id.toString(),
                label: generalDepartment.name || "General",
            });
        }

        return options;
    }, [generalDepartment, user?.department]);

    const yearOptions = useMemo(() => {
        const userYear = user?.year?.year;

        if (userYear == null) return [];

        const maxYear = userYear + 5;

        return years
            .filter(
                (year) =>
                    year.year != null &&
                    year.year >= userYear &&
                    year.year <= maxYear,
            )
            .sort((a, b) => (a.year || 0) - (b.year || 0))
            .map((year) => ({
                value: year.id?.toString() || "",
                label: year.year?.toString() || "",
            }))
            .filter((option) => option.value);
    }, [user?.year?.year, years]);

    useEffect(() => {
        const userDepartmentId = user?.department?.id;

        if (!userDepartmentId || departments.length === 0) {
            setDepartmentFilter("");
            return;
        }

        setDepartmentFilter(
            (current) => current || userDepartmentId.toString() || "",
        );
    }, [setDepartmentFilter, user, departments]);

    useEffect(() => {
        const userYearId = user?.year?.id;

        if (!userYearId || years.length === 0) {
            setYearFilter("");
            return;
        }

        setYearFilter((current) => current || userYearId.toString() || "");
    }, [setYearFilter, user, years]);

    const handleConfirm = useCallback(async () => {
        if (!selectedCourse?.id) return;

        try {
            if (action === "register") {
                await registerCourse({
                    subject_id: selectedCourse.id,
                }).unwrap();
                showToast(
                    "success",
                    "Success",
                    "Course registered successfully.",
                );
            }

            if (action === "unregister") {
                await unRegisterCourse({
                    subject_id: selectedCourse.id,
                }).unwrap();
                showToast(
                    "success",
                    "Success",
                    "Course unregistered successfully.",
                );
            }

            await fetchEnrolledCourses();
            await fetchAvailableCourses();
        } catch (error) {
            handlePopupErrors(error);
        } finally {
            setIsModalOpen(false);
            setSelectedCourse(null);
            setAction(null);
        }
    }, [
        selectedCourse,
        action,
        fetchEnrolledCourses,
        fetchAvailableCourses,
        registerCourse,
        unRegisterCourse,
    ]);

    return (
        <>
            <PageSeo
                title="Courses Settings - CU Portal"
                description="Manage your registered and available courses"
            />
            <Layout>
                <div className={styles.container}>
                    <div className={styles.mainCard}>
                        <h3 className={styles.pageTitle}>Courses Settings</h3>
                        <div className={styles.underline} />

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <IconComponent
                                    icon="hat"
                                    className={styles.hatIcon}
                                />
                                <span className={styles.sectionTitle}>
                                    Registered Courses
                                </span>
                                <span className={styles.courseBadge}>
                                    {registeredCourses.length} Courses
                                </span>
                            </div>

                            <div className={styles.cardsGrid}>
                                {registeredCourses.map((course) => (
                                    <Card
                                        key={course.id}
                                        title={course.name || undefined}
                                        badge={course.code || undefined}
                                        secondaryBadge={`${course.credits} Credits`}
                                        items={[
                                            {
                                                icon: "subject",
                                                label: "Faculty",
                                                value:
                                                    course.faculty?.name ||
                                                    undefined,
                                                color: "pink",
                                            },
                                            {
                                                icon: "location",
                                                label: "Department",
                                                value:
                                                    course.department?.name ||
                                                    undefined,
                                                color: "yellow",
                                            },
                                            {
                                                icon: "calendar",
                                                label: "Year",
                                                value:
                                                    course.year?.year?.toString() ||
                                                    undefined,
                                                color: "green",
                                            },
                                        ]}
                                        button="Unregister Course"
                                        buttonAction={() => {
                                            setSelectedCourse(course);
                                            setAction("unregister");
                                            setIsModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <IconComponent
                                    icon="hat"
                                    className={styles.hatIcon}
                                />
                                <span className={styles.sectionTitle}>
                                    Available Courses
                                </span>
                                {!showCourseFilterPrompt && (
                                    <span className={styles.courseBadge}>
                                        {availableCourses.length} Courses
                                    </span>
                                )}
                            </div>

                            <div className={styles.filtersContainer}>
                                <div className={styles.searchContainer}>
                                    <Search
                                        placeholder="Search by course name or code"
                                        setValue={setSearchQuery} value={searchQuery}
                                    />
                                </div>

                                {showDepartmentFilter && (
                                    <div className={styles.filterSelect}>
                                        <SelectFilter
                                            value={departmentFilter}
                                            options={departmentOptions}
                                            setValue={setDepartmentFilter}
                                            placeholder="Department"
                                        />
                                    </div>
                                )}

                                <div className={styles.filterSelect}>
                                    <SelectFilter
                                        value={yearFilter}
                                        options={yearOptions}
                                        setValue={setYearFilter}
                                        placeholder="Year"
                                    />
                                </div>
                            </div>

                            {showCourseFilterPrompt ? (
                                <NoContentSection
                                    icon="filter"
                                    label="Select a department and year to view available courses."
                                />
                            ) : availableCourses.length === 0 ? (
                                <NoContentSection
                                    icon="book"
                                    label="No available courses found."
                                />
                            ) : (
                                <div className={styles.cardsGrid}>
                                    {availableCourses.map((course) => (
                                        <Card
                                            key={course.id}
                                            title={course.name || undefined}
                                            badge={course.code || undefined}
                                            secondaryBadge={`${course.credits?.toString()} Credits`}
                                            items={[
                                                {
                                                    icon: "subject",
                                                    label: "Faculty",
                                                    value:
                                                        course.faculty?.name ||
                                                        undefined,
                                                    color: "pink",
                                                },
                                                {
                                                    icon: "location",
                                                    label: "Department",
                                                    value:
                                                        course.department
                                                            ?.name || undefined,
                                                    color: "yellow",
                                                },
                                                {
                                                    icon: "calendar",
                                                    label: "Year",
                                                    value:
                                                        course.year?.year?.toString() ||
                                                        undefined,
                                                    color: "green",
                                                },
                                            ]}
                                            button="Register Course"
                                            buttonAction={() => {
                                                setSelectedCourse(course);
                                                setAction("register");
                                                setIsModalOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <ConfirmModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirm}
                    confirmText={
                        action === "register" ? "Register" : "Unregister"
                    }
                    title={
                        action === "register"
                            ? "Confirm Course Registration"
                            : "Confirm Course Unregistration"
                    }
                    message={
                        action === "register"
                            ? "Are you sure you want to register for this course?"
                            : "Are you sure you want to unregister from this course?"
                    }
                    colorType={action === "register" ? "green" : "red"}
                />
            </Layout>
        </>
    );
};
