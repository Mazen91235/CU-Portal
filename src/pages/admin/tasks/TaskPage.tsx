import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useLazyGetTaskQuery } from "../../../services/apis/admin/TaskAPIs";
import type { Task } from "../../../types/entities/Task";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { Bordered } from "../../../components/bordered/Bordered";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import taskIcon from "../../../assets/icons/task-icon.svg";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import styles from "./TaskPage.module.css";
import { formatDateTime } from "../../../utils/Formatter";

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
                <div className={styles.statsRow}>
                    <StatCard
                        type="Subject"
                        value={task.subject?.name || "N/A"}
                        icon="book"
                    />
                    <StatCard
                        type="Deadline"
                        value={formatDateTime(task.deadline) || "N/A"}
                        icon="calendar"
                    />
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.mainContent}>
                        <Bordered>
                            <h4 className={styles.cardTitle}>
                                <i className="fas fa-file-text"></i>
                                Assignment Description
                            </h4>
                            <div className={styles.detailsSection}>
                                <div className={styles.descriptionContent}>
                                    {task.details?.description || (
                                        <span>No description available</span>
                                    )}
                                </div>

                                {task.details?.files_data &&
                                    task.details.files_data.length > 0 && (
                                        <AttachmentsAndLinksSection
                                            files={task.details.files_data}
                                            links={task.links || []}
                                        />
                                    )}
                            </div>
                        </Bordered>
                    </div>

                    <div className={styles.sidebar}>
                        {task.url && (
                            <Bordered>
                                <h4 className={styles.cardTitle}>
                                    <i className="fas fa-check-circle"></i>
                                    Submission Status
                                </h4>
                                <div className={styles.submissionContent}>
                                    <a
                                        href={task.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.submissionButton}
                                    >
                                        Go To Submission URL
                                    </a>
                                </div>
                            </Bordered>
                        )}

                        <Bordered>
                            <h4 className={styles.cardTitle}>
                                <i className="fas fa-info-circle"></i>
                                Quick Info
                            </h4>
                            <div className={styles.quickInfoList}>
                                <div className={styles.quickInfoRow}>
                                    <span className={styles.quickInfoLabel}>
                                        Type:
                                    </span>
                                    <span className={styles.quickInfoValue}>
                                        {task.type || "N/A"}
                                    </span>
                                </div>
                                <div className={styles.quickInfoRow}>
                                    <span className={styles.quickInfoLabel}>
                                        Faculty:
                                    </span>
                                    <span className={styles.quickInfoValue}>
                                        {task.faculty?.name || "N/A"}
                                    </span>
                                </div>
                                <div className={styles.quickInfoRow}>
                                    <span className={styles.quickInfoLabel}>
                                        Department:
                                    </span>
                                    <span className={styles.quickInfoValue}>
                                        {task.department?.name || "N/A"}
                                    </span>
                                </div>
                                <div className={styles.quickInfoRow}>
                                    <span className={styles.quickInfoLabel}>
                                        Year:
                                    </span>
                                    <span className={styles.quickInfoValue}>
                                        {task.year?.year?.toString() || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </Bordered>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
