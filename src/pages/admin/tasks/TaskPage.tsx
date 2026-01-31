import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useLazyGetTaskQuery } from "../../../services/apis/admin/TaskAPIs";
import type { Task } from "../../../types/entities/Task";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import styles from "./TaskPage.module.css";
import { SubBanner } from "../../../components/banner/SubBanner";
import taskIcon from "../../../assets/icons/task-icon.svg";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";

export const TaskPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<Task | null>(null);

    const [getTask] = useLazyGetTaskQuery();

    const fetchTask = useCallback(async () => {
        if (!taskId) return;

        try {
            const result = await getTask({
                task_id: parseInt(taskId),
            }).unwrap();
            setTask(result.data || null);
        } catch (error) {
            const err = error as DefaultAPIResponse;
            navigate("/admin/tasks", {
                state: { error: err.data.message || "Failed to fetch task" },
            });
        }
    }, [getTask, navigate, taskId]);

    const authQueryParams = useCallback(() => fetchTask(), [fetchTask]);

    useAuthQuery(authQueryParams);

    if (!task) {
        return null;
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (dateString?: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Layout>
            <PageSeo
                title={`${task.name} - Task Details - CU Portal`}
                description={`View and manage task information for ${task.name}`}
            />

            <SubBanner
                title={task.name || "Task Details"}
                icon={taskIcon}
                button="Edit Task"
                buttonAction={() => navigate(`/admin/tasks/edit/${task.id}`)}
                linkText="Back to Tasks"
                linkTo="/admin/tasks"
            />

            <div className={styles.container}>
                <div className={styles.taskStatsRow}>
                    <div className={styles.taskStatCard}>
                        <div
                            className={styles.taskStatImgbox}
                            style={{
                                backgroundColor: "rgba(37, 99, 235, 0.10)",
                            }}
                        >
                            <i
                                className="fas fa-calendar"
                                style={{ color: "#2563eb" }}
                            ></i>
                        </div>
                        <div className={styles.taskStatTexts}>
                            <div className={styles.taskStatTitle}>Deadline</div>
                            <div className={styles.taskStatValue}>
                                {formatDate(task.deadline)}
                            </div>
                        </div>
                    </div>
                    <div className={styles.taskStatCard}>
                        <div
                            className={styles.taskStatImgbox}
                            style={{
                                backgroundColor: "rgba(22, 163, 74, .1)",
                            }}
                        >
                            <i
                                className="fas fa-tag"
                                style={{ color: "#16a34a" }}
                            ></i>
                        </div>
                        <div className={styles.taskStatTexts}>
                            <div className={styles.taskStatTitle}>Type</div>
                            <div className={styles.taskStatValue}>
                                {task.type || "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.taskInfoRow}>
                    <div className={styles.taskInfoCard}>
                        <h4>Task Information</h4>
                        <ul className={styles.taskInfoList}>
                            <li>
                                <i className="fas fa-university"></i>
                                <div>
                                    <span className={styles.tiLabel}>
                                        Faculty
                                    </span>
                                    <span className={styles.tiValue}>
                                        {task.faculty?.name || "N/A"}
                                    </span>
                                </div>
                            </li>
                            <li>
                                <i className="fas fa-building"></i>
                                <div>
                                    <span className={styles.tiLabel}>
                                        Department
                                    </span>
                                    <span className={styles.tiValue}>
                                        {task.department?.name || "N/A"}
                                    </span>
                                </div>
                            </li>
                            <li>
                                <i className="fas fa-calendar-alt"></i>
                                <div>
                                    <span className={styles.tiLabel}>
                                        Academic Year
                                    </span>
                                    <span className={styles.tiValue}>
                                        {task.year?.year?.toString() || "N/A"}
                                    </span>
                                </div>
                            </li>
                            <li>
                                <i className="fas fa-book"></i>
                                <div>
                                    <span className={styles.tiLabel}>
                                        Subject
                                    </span>
                                    <span className={styles.tiValue}>
                                        {task.subject?.name || "N/A"}
                                    </span>
                                </div>
                            </li>
                            <li>
                                <i className="fas fa-clock"></i>
                                <div>
                                    <span className={styles.tiLabel}>
                                        Last Modified
                                    </span>
                                    <span className={styles.tiValue}>
                                        {formatDateTime(task.modified_at)}
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {task.details && (
                        <div className={styles.taskDetailsCard}>
                            <h4>Details</h4>
                            <div className={styles.detailsContent}>
                                {typeof task.details === "string" ? (
                                    <p>{task.details}</p>
                                ) : (
                                    <pre>
                                        {JSON.stringify(task.details, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>
                    )}

                    {task.urls && task.urls.length > 0 && (
                        <div className={styles.taskLinksCard}>
                            <h4>Resources</h4>
                            <ul className={styles.linksList}>
                                {task.urls.map((url, index) => (
                                    <li key={index}>
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.link}
                                        >
                                            <i className="fas fa-external-link-alt"></i>
                                            {url}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {task.links &&
                        Array.isArray(task.links) &&
                        task.links.length > 0 && (
                            <div className={styles.taskLinksCard}>
                                <h4>Additional Links</h4>
                                <ul className={styles.linksList}>
                                    {(
                                        task.links as unknown as {
                                            title?: string;
                                            url: string;
                                        }[]
                                    ).map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.link}
                                            >
                                                <i className="fas fa-external-link-alt"></i>
                                                {link.title || link.url}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                </div>
            </div>
        </Layout>
    );
};
