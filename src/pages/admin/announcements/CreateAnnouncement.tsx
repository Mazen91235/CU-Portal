import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateAnnouncementMutation } from "../../../services/apis/admin/AnnouncementAPIs";
import { useLazyGetCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import { handleErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { SearchableInput } from "../../../components/forms/SearchableInput";
import { Button } from "../../../components/forms/Button";
import { FilesInputContainer } from "../../../components/forms/FilesInputContainer";
import { LinksInputContainer } from "../../../components/forms/LinksInputContainer";
import { DateInput } from "../../../components/forms/DateInput";
import { Layout } from "../../../components/layout/Layout";
import { useAppSelector } from "../../../services/redux/Hooks";
import useAuthQuery from "../../../hooks/useAuthQuery";
import {
    useUploadFileToDrive,
    useRemoveUploadedFiles,
} from "../../../hooks/useHandleProcesses";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { Form } from "../../../components/forms/Form";
import { Heading } from "../../../components/heading/Heading";
import { mergeDateAndTime } from "../../../utils/Formatter";

import styles from "./CreateAnnouncement.module.css";

const announcementSchema = z.object({
    title: z.string().min(1, "Announcement title is required"),
    content: z.string().optional(),
    subject_id: z.string().min(1, "Subject is required"),
    date_date: z.string().optional(),
    date_time: z.string().optional(),
    files: z.any().optional(),
    links: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export const CreateAnnouncement = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const user = useAppSelector((state) => state.user.user);

    const [searchCourses] = useLazyGetCoursesQuery();
    const [createAnnouncement, { isLoading }] = useCreateAnnouncementMutation();
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
    } = useForm<AnnouncementFormData>({
        resolver: zodResolver(announcementSchema),
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
            navigate("/admin/announcements", {
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

    const onSubmit = async (data: AnnouncementFormData) => {
        const uploadedUrls: string[] = [];
        try {
            let urls = "";
            if (data.files && (data.files as FileList).length > 0) {
                setIsUploading(true);
                urls = await uploadFiles(data.files as FileList);
                urls.split(", ").filter(Boolean).forEach((url) => uploadedUrls.push(url));
                setIsUploading(false);
            }

            const announcementData = {
                title: data.title,
                content: data.content ?? "",
                subject_id: parseInt(data.subject_id),
                date: data.date_date
                    ? mergeDateAndTime(
                          data.date_date,
                          data.date_time || "00:00",
                      )
                    : undefined,
                details: {
                    urls: urls != "" ? urls.split(", ") : [],
                    links: data.links
                        ?.split(",")
                        .map((pair) => {
                            const [title, url] = pair.split("|");
                            return { title: title?.trim(), url: url?.trim() };
                        })
                        .filter((link) => link.title && link.url),
                },
            };

            await createAnnouncement(announcementData).unwrap();
            navigate("/admin/announcements", {
                state: { success: "Announcement created successfully!" },
            });
        } catch (error) {
            await removeUploadedFiles(uploadedUrls);
            handleErrors(error, setError);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/announcements");
    };

    return (
        <Layout>
            <PageSeo
                title="Create New Announcement | CU Portal"
                description="Add a new announcement for students"
            />
            <SubBanner
                title="Create New Announcement"
                description="Add a new announcement for students"
                icon="announcements"
                linkText="Back to Announcements"
                linkTo="/admin/announcements"
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
                            label="Announcement Title"
                            register={register}
                            name="title"
                            type="text"
                            placeholder="e.g., Important Exam Schedule Update"
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
                            label="Date"
                            placeholder="Select announcement date"
                            register={register}
                            name="date_date"
                            errors={errors}
                            setValue={setValue}
                            control={control}
                            disabled={isLoading || isUploading}
                        />
                        <Input
                            label="Time"
                            register={register}
                            name="date_time"
                            type="time"
                            placeholder="Select announcement time"
                            errors={errors}
                            disabled={isLoading || isUploading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <Input
                            label="Content"
                            register={register}
                            name="content"
                            type="textarea"
                            placeholder="Provide details about the announcement (optional)"
                            errors={errors}
                            disabled={isLoading || isUploading}
                            isTextArea
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
                            text="Create Announcement"
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
