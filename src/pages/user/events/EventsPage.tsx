import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useLazyGetTasksQuery } from "../../../services/apis/user/TaskAPIs";
import type { Task } from "../../../types/entities/Task";
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
import { formatDateTime } from "../../../utils/Formatter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import type { Subject } from "../../../types/entities/Subject";

import styles from "./TasksPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

export const EventsPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [dateFromFilter, setDateFromFilter] = useState(new Date().toLocaleDateString("en-CA")); // Set default date to today's date in "YYYY-MM-DD" format
    const [dateToFilter, setDateToFilter] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [searchParams] = useSearchParams();
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
                query: searchQuery || undefined,
                start_date: dateFromFilter || undefined,
                end_date: dateToFilter || undefined,
                subject_id: parseInt(subjectFilter) || undefined,
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
        searchQuery,
        subjectFilter,
        dateFromFilter,
        dateToFilter,
        page,
        hasNextPage,
    ]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchSubjects(), fetchTasks()]),
        [fetchSubjects, fetchTasks],
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

    const handleViewTask = (taskId: number) => {
        navigate(`/user/tasks/${taskId}`);
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
                title="Events - CU Portal"
                description="Discover amazing events happening on campus"
            />
            <Banner
                title="My Events"
                description="Discover amazing events happening on campus"
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
                        <SelectFilter
                            value={subjectFilter}
                            options={subjectOptions}
                            setValue={setSubjectFilter}
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

                <div className={styles.tasksGrid}>
                    {tasks.map((task) => (
                        <Card
                            key={task.id}
                            title={task.name || ""}
                            badge={task.subject?.code}
                            items={[
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
                            hasOptions
                            sharable
                            onShare={() => handleShareTask(task.id!)}
                        />
                    ))}
                </div>

                {tasks.length === 0 && !isFetching && (
                    <NoContentSection icon="events" label="No events found" />
                )}

                <Pagination onReached={handlePagination} />
            </div>
        </Layout>
    );
};
