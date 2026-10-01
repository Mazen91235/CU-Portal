import { useCallback, useState } from "react";
import { Bordered } from "../bordered/Bordered";
import { Heading } from "../heading/Heading";
import { Button } from "../forms/Button";
import {
    useCreateUserCompletionMutation,
    useDeleteUserCompletionMutation,
    useLazyGetUserCompletionsQuery,
} from "../../services/apis/user/UserCompletionAPIs";
import type { UserCompletionResponseDto } from "../../types/dtos/UserCompletionDtos";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import useAuthQuery from "../../hooks/useAuthQuery";

import styles from "./SubmissionSection.module.css";

export const SubmissionSection = ({
    url,
    taskId,
}: {
    url?: string | null;
    taskId?: number | null;
}) => {
    const [completion, setCompletion] =
        useState<UserCompletionResponseDto | null>(null);
    const [getUserCompletions] = useLazyGetUserCompletionsQuery();
    const [createUserCompletion, { isLoading: isCreating }] =
        useCreateUserCompletionMutation();
    const [deleteUserCompletion, { isLoading: isDeleting }] =
        useDeleteUserCompletionMutation();
    const completed = completion?.id != null;
    const isSubmitting = isCreating || isDeleting;

    const fetchCompletion = useCallback(async () => {
        if (taskId == null) return;

        try {
            const response = await getUserCompletions({
                data: { task_id: taskId },
            }).unwrap();
            setCompletion(response.data?.[0] || null);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getUserCompletions, taskId]);

    useAuthQuery(fetchCompletion);

    const toggleCompletion = async () => {
        if (taskId == null || isSubmitting) return;

        try {
            if (completion?.id != null) {
                await deleteUserCompletion({
                    user_completion_id: completion.id,
                }).unwrap();
                setCompletion(null);
            } else {
                const response = await createUserCompletion({
                    task_id: taskId,
                }).unwrap();
                setCompletion(response.data || null);
            }
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Bordered>
            <Heading
                icon="check-circle"
                content="Submission Status"
                size="large"
            />
            <div className={styles.submissionContent}>
                {url && (
                    <Button
                        text="Go To Submission URL"
                        loadingText=""
                        isSubmitting={false}
                        type="default"
                        onClick={() => window.open(url, "_blank")}
                    />
                )}
                <Button
                    text={completed ? "Mark as Incomplete" : "Mark as Complete"}
                    loadingText="Updating..."
                    isSubmitting={isSubmitting}
                    type="button"
                    isOrange={false}
                    isSecondary={completed}
                    onClick={toggleCompletion}
                    disabled={taskId == null}
                />
            </div>
        </Bordered>
    );
};
