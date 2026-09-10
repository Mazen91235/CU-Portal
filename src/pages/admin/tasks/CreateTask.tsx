import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTaskMutation } from "../../../services/apis/admin/TaskAPIs";
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
import {
    useUploadFileToDrive,
    useRemoveUploadedFiles,
} from "../../../hooks/useHandleProcesses";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { Form } from "../../../components/forms/Form";
import { mergeDateAndTime } from "../../../utils/Formatter";

import styles from "./CreateTask.module.css";
import { Heading } from "../../../components/heading/Heading";

const taskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    submission_url: z.string().optional(),
    subject_id: z.string().min(1, "Subject is required"),
    deadline_date: z.string().min(1, "Deadline date is required"),
    deadline_time: z.string().min(1, "Deadline time is required"),
    files: z.any().optional(),
    links: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const CreateTask = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const user = useAppSelector((state) => state.user.user);

    const [searchCourses] = useLazyGetCoursesQuery();
    const [createTask, { isLoading }] = useCreateTaskMutation();
    const uploadFile = useUploadFileToDrive({});
    const removeUploadedFiles = useRemoveUploadedFiles();
    const [isUploading, setIsUploading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
        control,
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
    });

    const busy = isSubmitting || isLoading || isUploading;

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
                state: { error: err.message || "Failed to fetch subjects." },
            });
        }
    }, [searchCourses, navigate, user]);

    const authQueryParams = useCallback(() => fetchSubjects(), [fetchSubjects]);

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
        const uploadedUrls: string[] = [];
        try {
            let urls = "";
            if (data.files && (data.files as FileList).length > 0) {
                setIsUploading(true);
                const uploaded = await uploadFiles(data.files as FileList);
                urls = uploaded;
                uploaded.split(", ").filter(Boolean).forEach((url) => uploadedUrls.push(url));
                setIsUploading(false);
            }

            const taskData = {
                name: data.title,
                url: data.submission_url || undefined,
                subject_id: parseInt(data.subject_id),
                deadline: mergeDateAndTime(
                    data.deadline_date,
                    data.deadline_time,
                )!,
                details: {
                    urls: urls ? urls.split(", ") : [],
                    links: data.links
                        ?.split(",")
                        .map((pair) => {
                            const [title, url] = pair.split("|");
                            return { title: title?.trim(), url: url?.trim() };
                        })
                        .filter(
                            (link): link is { title: string; url: string } =>
                                Boolean(link.title && link.url),
                        ),
                    description: data.description ?? undefined,
                },
            };

            await createTask(taskData).unwrap();
            navigate("/admin/tasks", {
                state: { success: "Task created successfully!" },
            });
        } catch (error) {
            await removeUploadedFiles(uploadedUrls);
            handleErrors(error, setError);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/tasks");
    };

    return (
        <Layout>
            <PageSeo
                title="Create New Task | CU Portal"
                description="Add a new assignment for your students"
            />
            <SubBanner
                title="Create New Task"
                description="Add a new assignment for your students"
                icon="task"
                linkText="Back to Tasks"
                linkTo="/admin/tasks"
            />
            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    disabled={busy}
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
                            placeholder="Select deadline date"
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
                            placeholder="Provide details about the task (optional)"
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
                            setValue={setValue}
                            disabled={isLoading || isUploading}
                        />

                        <LinksInputContainer
                            register={register}
                            name="links"
                            errors={errors}
                            setValue={setValue}
                            disabled={isLoading || isUploading}
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
                            text="Create Task"
                            loadingText="Creating..."
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
