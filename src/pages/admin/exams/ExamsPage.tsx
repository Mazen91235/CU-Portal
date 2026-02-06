import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    useLazyGetExamsQuery,
    useDeleteExamMutation,
} from "../../../services/apis/admin/ExamAPIs";
import { useLazySearchFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazySearchDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazySearchYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { useLazySearchCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import type { Task } from "../../../types/entities/Task";
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
import { formatDateTime } from "../../../utils/Formatter";
import { useAppSelector } from "../../../services/redux/Hooks";

import styles from "./ExamsPage.module.css";

export const ExamsPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");
    const [exams, setExams] = useState<Task[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Task | null>(null);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    const [searchCourses] = useLazySearchCoursesQuery();
    const [getExams, { isFetching }] = useLazyGetExamsQuery();
    const [deleteExam] = useDeleteExamMutation();

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

    const fetchExams = useCallback(async () => {
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
            const result = await getExams(params).unwrap();
            setExams((prev) => {
                const filteredPrev = prev.filter(
                    (exam) =>
                        !result.data?.some((newExam) => newExam.id === exam.id),
                );
                if (page == 1) return result.data || [];
                return [...filteredPrev, ...(result.data || [])];
            });
            setHasNextPage(result.next || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getExams,
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
                fetchExams(),
            ]),
        [
            fetchFaculties,
            fetchDepartments,
            fetchYears,
            fetchSubjects,
            fetchExams,
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

    const handleAddExam = () => {
        navigate("/admin/exams/create");
    };

    const handleEditExam = (examId: number) => {
        navigate(`/admin/exams/edit/${examId}`);
    };

    const handleDeleteClick = (exam: Task) => {
        setSelectedExam(exam);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedExam?.id) return;

        try {
            await deleteExam({
                exam_id: selectedExam.id,
            }).unwrap();
            showToast("success", "Success", "Exam deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedExam(null);
            setPage(1);
            setHasNextPage(true);
            await fetchExams();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleViewExam = (examId: number) => {
        navigate(`/admin/exams/${examId}`);
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && exams.length > 0) {
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
                title="Exams Management | CU Portal"
                description="Manage and view all exams in the university portal"
            />

            <Banner
                title="Exams Management"
                description="Manage and view all exams"
                button="Add New Exam"
                buttonAction={handleAddExam}
            />

            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search exams..."
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
                            placeholder="Date From"
                            setValue={setDateFromFilter}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateToFilter}
                        />
                    </div>
                </div>

                <div className={styles.examsGrid}>
                    {exams.map((exam) => (
                        <Card
                            key={exam.id}
                            title={exam.name || "Untitled Exam"}
                            badge={`${exam.department?.code} ${exam.year?.year}`}
                            items={[
                                {
                                    icon: "building",
                                    label: "Faculty",
                                    value: exam.faculty?.name || "N/A",
                                },
                                {
                                    icon: "subject",
                                    label: "Subject",
                                    value: exam.subject?.name || "N/A",
                                },
                                {
                                    icon: "calendar",
                                    label: "Date",
                                    value:
                                        formatDateTime(exam.deadline) || "N/A",
                                },
                                {
                                    icon: "location",
                                    label: "Location",
                                    value: exam.details?.location || "N/A",
                                },
                            ]}
                            button="View Exam"
                            buttonAction={() => handleViewExam(exam.id!)}
                            editable
                            deletable
                            hasOptions
                            onEdit={() => handleEditExam(exam.id!)}
                            onDelete={() => handleDeleteClick(exam)}
                        />
                    ))}
                </div>

                {exams.length === 0 && !isFetching && (
                    <NoContentSection
                        icon="clipboard-list"
                        label="No exams found"
                    />
                )}

                <Pagination onReached={handlePagination} />
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                confirmText="Delete"
                title="Delete Exam"
                message={`Are you sure you want to delete "${selectedExam?.name}"? This action cannot be undone.`}
            />
        </Layout>
    );
};
