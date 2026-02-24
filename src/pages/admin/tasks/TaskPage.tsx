import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";

import { useLazyGetTaskQuery } from "../../../services/apis/admin/TaskAPIs";
import type { Task } from "../../../types/entities/Task";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import { SubmissionSection } from "../../../components/section/SubmissionSection";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";

import { formatDateTime } from "../../../utils/Formatter";
import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./TaskPage.module.css";
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
                icon={GetIcon("task")}
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
                        <LongSection title="Task Description" icon="align-left">
                            <div className={styles.detailsSection}>
                                {task.details?.description || (
                                    <span>No description available</span>
                                )}

                                {((task.details?.files_data &&
                                    task.details.files_data.length > 0) ||
                                    (task.links && task.links.length > 0)) && (
                                    <AttachmentsAndLinksSection
                                        files={task.details?.files_data}
                                        links={task.links || []}
                                    />
                                )}
                            </div>
                        </LongSection>
                    </div>

                    <div className={styles.sidebar}>
                        {task.url && <SubmissionSection url={task.url} />}

                        <QuickInfoSection
                            items={[
                                { label: "Type:", value: task.type || "N/A" },
                                {
                                    label: "Faculty:",
                                    value: task.faculty?.name || "N/A",
                                },
                                {
                                    label: "Department:",
                                    value: task.department?.name || "N/A",
                                },
                                {
                                    label: "Year:",
                                    value: task.year?.year?.toString() || "N/A",
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};
