import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetAnnouncementQuery,
    useUpdateAnnouncementMutation,
} from "../../../services/apis/admin/AnnouncementAPIs";
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
import type { LinkData } from "../../../types/entities/Task";
import type { FileDataWithExisting } from "../../../types/entities/Attachment";
import type { AnnouncementResponseDto } from "../../../types/dtos/AnnouncementDtos";
import { Form } from "../../../components/forms/Form";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { Heading } from "../../../components/heading/Heading";
import {
    formatDateInputValue,
    formatTimeInputValue,
    mergeDateAndTime,
    toIsoFormat,
} from "../../../utils/Formatter";
import styles from "./EditAnnouncement.module.css";

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

export const EditAnnouncement = () => {
    const navigate = useNavigate();
    const { announcementId } = useParams<{ announcementId: string }>();
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [existingFiles, setExistingFiles] = useState<FileDataWithExisting[]>(
        [],
    );
    const [existingLinks, setExistingLinks] = useState<LinkData[]>([]);
    const [announcement, setAnnouncement] =
        useState<AnnouncementResponseDto | null>(null);
    const user = useAppSelector((state) => state.user.user);

    const [getAnnouncement] = useLazyGetAnnouncementQuery();
    const [searchCourses] = useLazyGetCoursesQuery();
    const [updateAnnouncement, { isLoading }] = useUpdateAnnouncementMutation();
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

    const busy =
        isSubmitting ||
        isLoading ||
        isUploading ||
        uploadFile.isGoogleAccessTokenLoading;

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
                state: {
                    error: err.message || "Failed to fetch subjects",
                },
            });
        }
    }, [searchCourses, navigate, user]);

    const fetchAnnouncement = useCallback(async () => {
        if (!announcementId) return;

        try {
            const result = await getAnnouncement({
                announcement_id: parseInt(announcementId),
            }).unwrap();
            const announcement = result.data;
            setAnnouncement(announcement || null);
            if (announcement) {
                setValue("title", announcement.title || "");
                setValue("content", announcement.content || "");
                if (announcement.date) {
                    setValue(
                        "date_date",
                        formatDateInputValue(announcement.date),
                    );
                    setValue(
                        "date_time",
                        formatTimeInputValue(announcement.date),
                    );
                } else {
                    setValue("date_date", "");
                    setValue("date_time", "");
                }
                setExistingFiles(
                    announcement.attachments
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
                    announcement.attachments
                        ?.filter((a) => !a.is_file)
                        .map((a) => {
                            return {
                                title: a.details?.link_title || "Untitled Link",
                                url: a.url || "",
                            };
                        })
                        .filter((link) => !!link.url) || [],
                );
            }
        } catch (error) {
            const err = (error as DefaultAPIResponse).data;
            navigate("/admin/announcements", {
                state: {
                    error: err.message || "Failed to fetch announcement",
                },
            });
        }
    }, [announcementId, getAnnouncement, setValue, navigate]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchSubjects(), fetchAnnouncement()]),
        [fetchSubjects, fetchAnnouncement],
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

    const onSubmit = async (data: AnnouncementFormData) => {
        if (!announcementId) return;

        const uploadedUrls: string[] = [];

        try {
            let urls = existingFiles.map((file) => file.url).join(", ");
            if (data.files && (data.files as FileList).length > 0) {
                setIsUploading(true);
                const newUrls = await uploadFiles(data.files as FileList);
                newUrls
                    .split(", ")
                    .filter(Boolean)
                    .forEach((url) => uploadedUrls.push(url));
                urls = urls ? `${urls}, ${newUrls}` : newUrls;
                setIsUploading(false);
            }

            const announcementData = {
                announcement_id: parseInt(announcementId),
                title: data.title,
                content: data.content || "",
                subject_id: parseInt(data.subject_id),
                date: toIsoFormat(
                    data.date_date
                        ? mergeDateAndTime(
                              data.date_date,
                              data.date_time || "00:00",
                          )
                        : undefined,
                ),
                details: {
                    urls: urls != "" ? urls.split(", ") : [],
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
                },
            };

            await updateAnnouncement(announcementData).unwrap();
            navigate("/admin/announcements", {
                state: { success: "Announcement updated successfully" },
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

    useEffect(() => {
        if (announcement && subjects?.length > 0) {
            setValue("subject_id", announcement.subject?.id?.toString() || "");
        }
    }, [announcement, subjects, setValue]);

    return (
        <Layout>
            <PageSeo
                title="Edit Announcement | CU Portal"
                description="Update announcement information"
            />
            <SubBanner
                title="Edit Announcement"
                description="Update announcement information"
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
                            placeholder="Enter announcement content..."
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
                            text="Update Announcement"
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
