import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useLazyGetTaskQuery } from "../../../services/apis/user/TaskAPIs";
import type { TaskResponseDto } from "../../../types/dtos/TaskDtos";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import { SubmissionSection } from "../../../components/section/SubmissionSection";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { getErrorMessage } from "../../../utils/ErrorHandling";
import { formatDateTime } from "../../../utils/Formatter";

import styles from "./TaskPage.module.css";

export const TaskPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<TaskResponseDto | null>(null);

    const [getTask] = useLazyGetTaskQuery();

    const fetchTask = useCallback(async () => {
        if (!taskId) return;

        try {
            const result = await getTask({
                task_id: parseInt(taskId),
            }).unwrap();
            const task = result.data;
            if (!task) {
                navigate("/user/tasks", {
                    state: { error: "Failed to fetch task" },
                });
                return;
            }
            setTask(task);
        } catch (error) {
            navigate("/user/tasks", {
                state: { error: getErrorMessage(error) || "Failed to fetch task" },
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
                description={`View task information for ${task.name}`}
            />

            <SubBanner
                title={task.name || "Task Details"}
                icon="task"
                linkText="Back to Tasks"
                linkTo="/user/tasks"
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
                        <LongSection title="Task Description" icon="align-left">
                            <div className={styles.detailsSection}>
                                {task.details?.description || (
                                    <span>No description available</span>
                                )}

                                {task.attachments &&
                                    task.attachments.length > 0 && (
                                        <AttachmentsAndLinksSection
                                            attachments={task.attachments}
                                        />
                                    )}
                            </div>
                        </LongSection>
                    </div>

                    <div className={styles.sidebar}>
                        {task.url && <SubmissionSection url={task.url} />}

                        <QuickInfoSection
                            items={[
                                {
                                    label: "Type:",
                                    value: task.task_type || "N/A",
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};
