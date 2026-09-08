import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";

import {
    useLazyGetTaskQuery,
    useDeleteTaskMutation,
} from "../../../services/apis/admin/TaskAPIs";
import type { TaskResponseDto } from "../../../types/dtos/TaskDtos";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { AttachmentsAndLinksSection } from "../../../components/preview/AttachmentsAndLinksSection";
import { QuickInfoSection } from "../../../components/section/QuickInfoSection";
import { LongSection } from "../../../components/section/LongSection";
import { SubmissionSection } from "../../../components/section/SubmissionSection";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { handlePopupErrors } from "../../../utils/ErrorHandling";

import { formatDateTime } from "../../../utils/Formatter";

import styles from "./TaskPage.module.css";
export const TaskPage = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const [task, setTask] = useState<TaskResponseDto | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [getTask] = useLazyGetTaskQuery();
    const [deleteTask] = useDeleteTaskMutation();

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

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!task?.id) return;

        try {
            await deleteTask({ task_id: task.id }).unwrap();
            navigate("/admin/tasks", {
                state: { success: "Task deleted successfully" },
            });
        } catch (error) {
            handlePopupErrors(error);
        }
    };

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
                icon="task"
                button="Edit Task"
                buttonAction={() => navigate(`/admin/tasks/edit/${task.id}`)}
                deleteButton="Delete Task"
                deleteAction={handleDeleteClick}
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
                                {
                                    label: "Faculty:",
                                    value: task.subject?.faculty?.name || "N/A",
                                },
                                {
                                    label: "Department:",
                                    value:
                                        task.subject?.department?.name || "N/A",
                                },
                                {
                                    label: "Year:",
                                    value:
                                        task.subject?.year?.toString() || "N/A",
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                confirmText="Delete"
                title="Delete Task"
                message={`Are you sure you want to delete "${task.name}"? This action cannot be undone.`}
                colorType="red"
            />
        </Layout>
    );
};
