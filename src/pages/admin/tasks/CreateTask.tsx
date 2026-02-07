import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateTaskMutation } from "../../../services/apis/admin/TaskAPIs";
import { useLazySearchCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import type { Subject } from "../../../types/entities/Subject";
import { handleErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { SearchableInput } from "../../../components/forms/SearchableInput";
import { Button } from "../../../components/forms/Button";
import { FilesInputContainer } from "../../../components/forms/FilesInputContainer";
import { LinksInputContainer } from "../../../components/forms/LinksInputContainer";
import { Layout } from "../../../components/layout/Layout";
import { useAppSelector } from "../../../services/redux/Hooks";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useUploadFileToDrive } from "../../../hooks/useHandleProcesses";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { Form } from "../../../components/forms/Form";

import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./CreateTask.module.css";
import { Heading } from "../../../components/heading/Heading";

const taskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    submission_url: z.string().optional(),
    subject_id: z.string().min(1, "Subject is required"),
    deadline: z.string().min(1, "Deadline is required"),
    files: z.any().optional(),
    links: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export const CreateTask = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const user = useAppSelector((state) => state.user.user);

    const [searchCourses] = useLazySearchCoursesQuery();
    const [createTask, { isLoading }] = useCreateTaskMutation();
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
            params.faculty_id = user.faculty?.id;
            params.department_id = user.department?.id;
            params.year_id = user.year?.id;
            const result = await searchCourses(params).unwrap();
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
        try {
            let urls = "";
            if (data.files && (data.files as FileList).length > 0) {
                setIsUploading(true);
                urls = await uploadFiles(data.files as FileList);
                setIsUploading(false);
            }

            const taskData = {
                title: data.title,
                description: data.description,
                submission_url: data.submission_url,
                subject_id: parseInt(data.subject_id),
                deadline: data.deadline,
                urls: urls != "" ? urls.split(", ") : [],
                links: data.links
                    ?.split(",")
                    .map((pair) => {
                        const [title, url] = pair.split("|");
                        return { title: title?.trim(), url: url?.trim() };
                    })
                    .filter((link) => link.title && link.url),
            };

            await createTask(taskData).unwrap();
            navigate("/admin/tasks", {
                state: { success: "Task created successfully!" },
            });
        } catch (error) {
            handleErrors(error, setError);
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
                icon={GetIcon("task")}
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
                        <Input
                            label="Deadline"
                            register={register}
                            name="deadline"
                            type="datetime-local"
                            placeholder="Select deadline date and time"
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
