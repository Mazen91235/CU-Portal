import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetTaskQuery,
    useUpdateTaskMutation,
} from "../../../services/apis/admin/TaskAPIs";
import { useLazyGetCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import { handleErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { DateInput } from "../../../components/forms/DateInput";
import { SearchableInput } from "../../../components/forms/SearchableInput";
import { Button } from "../../../components/forms/Button";
import { FilesInputContainer } from "../../../components/forms/FilesInputContainer";
import { LinksInputContainer } from "../../../components/forms/LinksInputContainer";
import { Layout } from "../../../components/layout/Layout";
import { useAppSelector } from "../../../services/redux/Hooks";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useUploadFileToDrive } from "../../../hooks/useHandleProcesses";
import type { LinkData } from "../../../types/entities/Task";
import type { FileDataWithExisting } from "../../../types/entities/Attachment";
import { Form } from "../../../components/forms/Form";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";

import {
    formatDateInputValue,
    formatTimeInputValue,
    mergeDateAndTime,
} from "../../../utils/Formatter";
import type { TaskResponseDto } from "../../../types/dtos/TaskDtos";
import styles from "./EditTask.module.css";
import { Heading } from "../../../components/heading/Heading";

const taskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    submission_url: z.string().optional(),
    subject_id: z.string().min(1, "Subject is required"),
    deadline_date: z.string().optional(),
    deadline_time: z.string().optional(),
    files: z.any().optional(),
    links: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const EditTask = () => {
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId: string }>();
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [existingFiles, setExistingFiles] = useState<FileDataWithExisting[]>(
        [],
    );
    const [existingLinks, setExistingLinks] = useState<LinkData[]>([]);
    const [task, setTask] = useState<TaskResponseDto | null>(null);
    const user = useAppSelector((state) => state.user.user);

    const [getTask] = useLazyGetTaskQuery();
    const [searchCourses] = useLazyGetCoursesQuery();
    const [updateTask, { isLoading }] = useUpdateTaskMutation();
    const uploadFile = useUploadFileToDrive({});
    const [isUploading, setIsUploading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
        control,
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
    });

    const fetchSubjects = useCallback(async () => {
        try {
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};
            if (!user) return;
            params.faculty_id = user.faculty?.id ?? undefined;
            params.department_id = user.department?.id ?? undefined;
            params.year_id = user.year?.id ?? undefined;

            const result = await searchCourses({ data: params }).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            const err = (error as DefaultAPIResponse).data;
            navigate("/admin/tasks", {
                state: {
                    error: err.message || "Failed to fetch subjects",
                },
            });
        }
    }, [searchCourses, navigate, user]);

    const fetchTask = useCallback(async () => {
        if (!taskId) return;

        try {
            const result = await getTask({
                task_id: parseInt(taskId),
            }).unwrap();
            const task = result.data;
            setTask(task || null);
            if (task) {
                setValue("title", task.name || "");
                setValue("description", task.details?.description || "");
                setValue("submission_url", task.url || "");
                if (task.deadline) {
                    setValue(
                        "deadline_date",
                        formatDateInputValue(task.deadline),
                    );
                    setValue(
                        "deadline_time",
                        formatTimeInputValue(task.deadline),
                    );
                } else {
                    setValue("deadline_date", "");
                    setValue("deadline_time", "");
                }
                setExistingFiles(
                    task.attachments
                        ?.filter((a) => a.is_file)
                        .map((a) => {
                            return {
                                ...(a.details?.file_data || {}),
                                url: a.url || "",
                            };
                        })
                        .filter((file) => !!file) || [],
                );
                setExistingLinks(
                    task.attachments
                        ?.filter((a) => !a.is_file)
                        .map((a) => {
                            return {
                                title: a.details?.link_title || "Untitled Link",
                                url: a.url || "",
                            };
                        })
                        .filter((link) => !!link) || [],
                );
            }
        } catch (error) {
            const err = (error as DefaultAPIResponse).data;
            navigate("/admin/tasks", {
                state: {
                    error: err.message || "Failed to fetch task",
                },
            });
        }
    }, [taskId, getTask, setValue, navigate]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchSubjects(), fetchTask()]),
        [fetchSubjects, fetchTask],
    );

    useAuthQuery(authQueryParams);

    const uploadFiles = async (files: FileList): Promise<string> => {
        const urls: string[] = [];

        for (const file of Array.from(files)) {
            const url = await uploadFile(file);
            if (url) urls.push(url);
        }

        return urls.join(", ");
    };

    const onSubmit = async (data: TaskFormData) => {
        if (!taskId) return;

        try {
            let urls = existingFiles
                .map((file) => file.url)
                .join(", ");
            if (data.files && (data.files as FileList).length > 0) {
                setIsUploading(true);
                const newUrls = await uploadFiles(data.files as FileList);
                urls = urls ? `${urls}, ${newUrls}` : newUrls;
                setIsUploading(false);
            }

            const taskData = {
                task_id: parseInt(taskId),
                name: data.title,
                url: data.submission_url || undefined,
                subject_id: parseInt(data.subject_id),
                deadline: mergeDateAndTime(
                    data.deadline_date,
                    data.deadline_time,
                )!,
                details: {
                    urls: urls ? urls.split(", ") : [],
                    links: (() => {
                        const newLinks = data.links
                            ? data.links
                                  .split(",")
                                  .map((pair) => {
                                      const [title, url] = pair.split("|");
                                      return {
                                          title: title?.trim(),
                                          url: url?.trim(),
                                      };
                                  })
                                  .filter((link) => link.title && link.url)
                            : [];
                        return newLinks.length > 0 ? newLinks : undefined;
                    })(),
                    description: data.description ?? undefined,
                },
            };

            await updateTask(taskData).unwrap();
            navigate("/admin/tasks", {
                state: { success: "Task updated successfully" },
            });
        } catch (error) {
            handleErrors(error, setError);
        }
    };

    const handleCancel = () => {
        navigate("/admin/tasks");
    };

    useEffect(() => {
        if (task && subjects?.length > 0) {
            setValue("subject_id", task.subject?.id?.toString() || "");
        }
    }, [task, subjects, setValue]);

    return (
        <Layout>
            <PageSeo
                title="Edit Task | CU Portal"
                description="Update task information"
            />
            <SubBanner
                title="Edit Task"
                description="Update task information"
                icon="task"
                linkText="Back to Tasks"
                linkTo="/admin/tasks"
            />
            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    className={styles.formCard}
                >
                    <div className={styles.formGroup}>
                        <Input
                            label="Task Title"
                            register={register}
                            name="title"
                            type="text"
                            placeholder="e.g., Data Structures Assignment #3"
                            errors={errors}
                            disabled={isLoading || isUploading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <SearchableInput
                            label="Subject"
                            register={register}
                            name="subject_id"
                            errors={errors}
                            disabled={isLoading || isUploading}
                            setValue={setValue}
                            control={control}
                            options={subjects.map((subject) => ({
                                value: subject.id?.toString() || "",
                                label: subject.name || "",
                            }))}
                            placeholder="Select a subject"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <DateInput
                            label="Deadline"
                            placeholder="Select deadline"
                            register={register}
                            name="deadline_date"
                            errors={errors}
                            setValue={setValue}
                            control={control}
                            disabled={isLoading || isUploading}
                        />
                        <Input
                            label="Deadline Time"
                            register={register}
                            name="deadline_time"
                            type="time"
                            placeholder="Select deadline time"
                            errors={errors}
                            disabled={isLoading || isUploading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <Input
                            label="Description"
                            register={register}
                            name="description"
                            type="textarea"
                            placeholder="Enter task description..."
                            errors={errors}
                            disabled={isLoading || isUploading}
                            isTextArea
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <Input
                            label="Submission URL"
                            register={register}
                            name="submission_url"
                            type="url"
                            placeholder="e.g., https://submission-portal.com/submit"
                            errors={errors}
                            disabled={isLoading || isUploading}
                        />
                    </div>

                    <div className={styles.attachmentsSection}>
                        <Heading
                            icon="paperclip"
                            content="Attachments & Links"
                            size="medium"
                        />

                        <FilesInputContainer
                            register={register}
                            name="files"
                            errors={errors}
                            disabled={isLoading || isUploading}
                            setValue={setValue}
                            existingFiles={existingFiles.map((file, index) => ({
                                id: `existing-${index}`,
                                name: file.name || `File ${index + 1}`,
                                url: file.url || "",
                                isExisting: true,
                            }))}
                            setExistingFiles={(files) => {
                                const updatedFileData = files.map((file) => ({
                                    name: file.name,
                                    url: file.url,
                                    size: file.size,
                                }));
                                setExistingFiles(updatedFileData);
                            }}
                        />

                        <LinksInputContainer
                            register={register}
                            name="links"
                            errors={errors}
                            disabled={isLoading || isUploading}
                            setValue={setValue}
                            existingLinks={existingLinks.map((link) => ({
                                title: link.title || "",
                                url: link.url || "",
                                isExisting: true,
                            }))}
                            setExistingLinks={(links) => {
                                setExistingLinks(
                                    links.map((link) => ({
                                        title: link.title,
                                        url: link.url,
                                    })),
                                );
                            }}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <Button
                            text="Cancel"
                            loadingText="Cancelling..."
                            type="button"
                            isSubmitting={false}
                            onClick={handleCancel}
                            isSecondary={true}
                        />
                        <Button
                            text="Update Task"
                            loadingText="Updating..."
                            isSubmitting={isLoading || isUploading}
                            type="submit"
                            isOrange={false}
                        />
                    </div>
                </Form>
            </main>
        </Layout>
    );
};
