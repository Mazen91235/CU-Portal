import { useState, useCallback, useEffect, useMemo } from "react";
import { buildRedirectUrl } from "../../../utils/Navigation";
import { useNavigate } from "react-router";
import { useLazyGetTasksQuery } from "../../../services/apis/user/TaskAPIs";
import type { TaskResponseDto } from "../../../types/dtos/TaskDtos";
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
import { formatDateTime, toIsoFormat } from "../../../utils/Formatter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";

import styles from "./TasksPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

export const TasksPage = () => {
    const navigate = useNavigate();
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");
    const subjectFilter = getFilter("subject_id", "");
    const setSubjectFilter = getFilterSetter("subject_id");
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const dateFromFilter = getFilter("date_from", new Date().toLocaleDateString("en-CA"));
    const setDateFromFilter = getFilterSetter("date_from", true);
    const dateToFilter = getFilter("date_to", "");
    const setDateToFilter = getFilterSetter("date_to", true);
    const [tasks, setTasks] = useState<TaskResponseDto[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [getSubjects] = useLazyGetEnrolledCoursesQuery();
    const [getTasks, { isFetching }] = useLazyGetTasksQuery();

    const fetchSubjects = useCallback(async () => {
        try {
            const result = await getSubjects().unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getSubjects]);

    const fetchTasks = useCallback(async () => {
        try {
            if (!hasNextPage) return;
            const result = await getTasks({
                data: {
                    query: searchQuery || undefined,
                    deadline_from: toIsoFormat(dateFromFilter),
                    deadline_to: toIsoFormat(dateToFilter),
                    subject_id: parseInt(subjectFilter) || undefined,
                },
                includes: ["subject"],
                order_by: ["deadline_nearest"],
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
            setHasNextPage(result.next_page || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getTasks,
        searchQuery,
        subjectFilter,
        dateFromFilter,
        dateToFilter,
        page,
        hasNextPage,
    ]);

    const authFilterQuery = useCallback(
        () => Promise.all([fetchSubjects()]),
        [fetchSubjects],
    );

    const authFetchTasksQuery = useCallback(
        () => fetchTasks(),
        [fetchTasks],
    );

    useAuthQuery(authFilterQuery);
    useAuthQuery(authFetchTasksQuery);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, subjectFilter, dateFromFilter, dateToFilter]);

    const handleViewTask = (taskId: number) => {
        navigate(buildRedirectUrl(`/user/tasks/${taskId}`));
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && tasks.length > 0) {
            setPage(page + 1);
        }
    };

    const handleShareTask = (taskId: number) => {
        const url = `${window.location.origin}/user/tasks/${taskId}`;
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "Task link copied to clipboard successfully",
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
                title="Tasks - CU Portal"
                description="View all your university tasks and assignments"
            />
            <Banner
                title="My Tasks"
                description="View all your university tasks and assignments"
            />
            <div className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.searchRow}>
                        <Search
                            placeholder="Search tasks..."
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
                            placeholder="Date From"
                            setValue={setDateFromFilter}
                            defaultDate={dateFromFilter} // Set default date to today's date in "YYYY-MM-DD" format
                            value={dateFromFilter}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateToFilter}
                            value={dateToFilter}
                            startDay={false}
                        />
                    </div>
                </div>

                <div className={styles.tasksGrid}>
                    {tasks.map((task) => (
                        <Card
                            key={task.id}
                            title={task.name || ""}
                            badge={task.subject?.code || undefined}
                            items={[
                                {
                                    icon: "subject",
                                    label: "Subject",
                                    value: task.subject?.name || "N/A",
                                },
                                {
                                    icon: "calendar",
                                    label: "Deadline",
                                    value: formatDateTime(
                                        task.deadline?.toLocaleString(),
                                    ),
                                },
                            ]}
                            button="View Task"
                            buttonAction={() => handleViewTask(task.id!)}
                            hasOptions
                            sharable
                            onShare={() => handleShareTask(task.id!)}
                        />
                    ))}
                </div>

                {tasks.length === 0 && !isFetching && (
                    <NoContentSection icon="tasks" label="No tasks found" />
                )}

                <Pagination onReached={handlePagination} />
            </div>
        </Layout>
    );
};
