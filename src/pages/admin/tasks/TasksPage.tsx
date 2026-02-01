import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import {
    useLazyGetTasksQuery,
    useDeleteTaskMutation,
} from "../../../services/apis/admin/TaskAPIs";
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

import styles from "./TasksPage.module.css";
import { formatDateTime } from "../../../utils/Formatter";

export const TasksPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [dateFromFilter, setDateFromFilter] = useState("");
    const [dateToFilter, setDateToFilter] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);

    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    const [searchCourses] = useLazySearchCoursesQuery();
    const [getTasks, { isFetching }] = useLazyGetTasksQuery();
    const [deleteTask] = useDeleteTaskMutation();

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
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};
            if (facultyFilter) params.faculty_id = parseInt(facultyFilter);
            if (departmentFilter)
                params.department_id = parseInt(departmentFilter);
            if (yearFilter) params.year_id = parseInt(yearFilter);

            if (Object.keys(params).length < 3) {
                setSubjects([]);
                return;
            }

            const result = await searchCourses(params).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchCourses, facultyFilter, departmentFilter, yearFilter]);

    const fetchTasks = useCallback(async () => {
        try {
            if (!hasNextPage) return;
            const result = await getTasks({
                title: searchQuery || undefined,
                faculty_id: facultyFilter ? parseInt(facultyFilter) : undefined,
                department_id: departmentFilter
                    ? parseInt(departmentFilter)
                    : undefined,
                year_id: yearFilter ? parseInt(yearFilter) : undefined,
                subject_id: subjectFilter ? parseInt(subjectFilter) : undefined,
                start_date: dateFromFilter || undefined,
                end_date: dateToFilter || undefined,
                page,
            }).unwrap();
            setTasks((prev) => {
                const filteredPrev = prev.filter(
                    (task) =>
                        !result.data?.some((newTask) => newTask.id === task.id),
                );
                if (page == 1) return result.data || [];
                return [...filteredPrev, ...(result.data || [])];
            });
            setHasNextPage(result.next || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getTasks,
        facultyFilter,
        departmentFilter,
        yearFilter,
        subjectFilter,
        searchQuery,
        dateFromFilter,
        dateToFilter,
        page,
        hasNextPage,
    ]);

    const authQueryParams = useCallback(
        () =>
            Promise.all([
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
                fetchSubjects(),
                fetchTasks(),
            ]),
        [
            fetchFaculties,
            fetchDepartments,
            fetchYears,
            fetchSubjects,
            fetchTasks,
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

    const handleAddTask = () => {
        navigate("/admin/tasks/create");
    };

    const handleEditTask = (taskId: number) => {
        navigate(`/admin/tasks/edit/${taskId}`);
    };

    const handleDeleteClick = (task: Task) => {
        setSelectedTask(task);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedTask?.id) return;

        try {
            await deleteTask({
                task_id: selectedTask.id,
            }).unwrap();
            showToast("success", "Success", "Task deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedTask(null);
            setPage(1);
            setHasNextPage(true);
            await fetchTasks();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleViewTask = (taskId: number) => {
        navigate(`/admin/tasks/${taskId}`);
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && tasks.length > 0) {
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

    useEffect(() => {
        if (page > 1) {
            fetchTasks();
        }
    }, [page, fetchTasks]);

    return (
        <Layout>
            <PageSeo
                title="Tasks Management - CU Portal"
                description="Manage all university tasks and assignments"
            />
            <Banner
                title="Tasks Management"
                description="Manage all university tasks and assignments"
                button="Add New Task"
                buttonAction={handleAddTask}
            />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search tasks..."
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

                <div className={styles.tasksGrid}>
                    {tasks.map((task) => (
                        <Card
                            key={task.id}
                            title={task.name || ""}
                            badge={`${task.department?.code} ${task.year?.year}`}
                            items={[
                                {
                                    icon: "building",
                                    label: "Faculty",
                                    value: task.faculty?.name || "N/A",
                                },
                                {
                                    icon: "subject",
                                    label: "Subject",
                                    value: task.subject?.name || "N/A",
                                },
                                {
                                    icon: "calendar",
                                    label: "Deadline",
                                    value: formatDateTime(task.deadline),
                                },
                            ]}
                            button="View Task"
                            buttonAction={() => handleViewTask(task.id!)}
                            editable
                            deletable
                            hasOptions
                            onEdit={() => handleEditTask(task.id!)}
                            onDelete={() => handleDeleteClick(task)}
                        />
                    ))}
                </div>

                {tasks.length === 0 && !isFetching && (
                    <NoContentSection icon="tasks" label="No tasks found" />
                )}

                <Pagination onReached={handlePagination} />
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Task"
                message={`Are you sure you want to delete "${selectedTask?.name}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </Layout>
    );
};
