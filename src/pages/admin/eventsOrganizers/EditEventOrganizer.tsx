import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Form } from "../../../components/forms/Form";
import { Input } from "../../../components/forms/Input";
import { Thumbnail } from "../../../components/forms/Thumbnail";
import { FilesInputContainer } from "../../../components/forms/FilesInputContainer";
import {
    LinksInputContainer,
    type LinkDataWithExisting,
} from "../../../components/forms/LinksInputContainer";
import { Heading } from "../../../components/heading/Heading";
import { Button } from "../../../components/forms/Button";
import { useAuthQuery } from "../../../hooks/useAuthQuery";
import {
    useLazyGetEventOrganizerQuery,
    useUpdateEventOrganizerMutation,
} from "../../../services/apis/admin/EventOrganizerAPIs";
import {
    useUploadFileToDrive,
    useRemoveUploadedFiles,
} from "../../../hooks/useHandleProcesses";
import type { FileDataWithExisting } from "../../../types/entities/Attachment";
import { handleErrors, handlePopupErrors } from "../../../utils/ErrorHandling";
import styles from "./EditEventOrganizer.module.css";

const schema = z.object({
    name: z.string().trim().min(1, "Organizer name is required"),
    logo: z
        .any()
        .refine(
            (value) =>
                (typeof value === "string" && value.length > 0) ||
                value instanceof File ||
                Boolean(
                    value &&
                    typeof value === "object" &&
                    "length" in value &&
                    Number(value.length) > 0,
                ),
            "Logo is required",
        ),
    files: z.any().optional(),
    links: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const parseLinks = (value?: string) =>
    value
        ? value
              .split(",")
              .map((pair) => {
                  const [title, url] = pair.split("|");
                  return { title: title?.trim(), url: url?.trim() };
              })
              .filter((link): link is { title: string; url: string } =>
                  Boolean(link.title && link.url),
              )
        : [];

export const EditEventOrganizer = () => {
    const { eventOrganizerId } = useParams<{ eventOrganizerId: string }>();
    const navigate = useNavigate();
    const [getEventOrganizer, { isFetching }] = useLazyGetEventOrganizerQuery();
    const [updateEventOrganizer, { isLoading }] =
        useUpdateEventOrganizerMutation();
    const uploadFile = useUploadFileToDrive({});
    const removeUploadedFiles = useRemoveUploadedFiles();
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
    const [existingFiles, setExistingFiles] = useState<FileDataWithExisting[]>(
        [],
    );
    const [existingLinks, setExistingLinks] = useState<LinkDataWithExisting[]>(
        [],
    );
    const [isUploading, setIsUploading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
    } = useForm<FormData>({ resolver: zodResolver(schema) });
    const busy = isSubmitting || isLoading || isUploading || isFetching || uploadFile.isGoogleAccessTokenLoading;

    const fetchOrganizer = useCallback(async () => {
        if (!eventOrganizerId) return;
        try {
            const result = await getEventOrganizer({
                event_organizer_id: Number(eventOrganizerId),
            }).unwrap();
            const data = result.data;
            if (!data) return;
            setValue("name", data.name || "");
            const logoUrl = data.logo?.url || null;
            setExistingLogoUrl(logoUrl);
            if (logoUrl) setValue("logo", logoUrl, { shouldValidate: true });
            const attachments = data.attachments || [];
            setExistingFiles(
                attachments
                    .filter(
                        (attachment) => attachment.is_file && attachment.url,
                    )
                    .map((attachment) => ({
                        ...(attachment.details?.file_data || {}),
                        url: attachment.url || "",
                        isExisting: true,
                    })),
            );
            setExistingLinks(
                attachments
                    .filter(
                        (attachment) => !attachment.is_file && attachment.url,
                    )
                    .map((attachment) => ({
                        title: attachment.details?.link_title || "Link",
                        url: attachment.url || "",
                        isExisting: true,
                    })),
            );
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getEventOrganizer, eventOrganizerId, setValue]);

    const authQueryParams = useCallback(
        () => fetchOrganizer(),
        [fetchOrganizer],
    );

    useAuthQuery(authQueryParams);

    const onSubmit = async (data: FormData) => {
        if (!eventOrganizerId) return;
        const uploadedUrls: string[] = [];

        try {
            setIsUploading(true);
            const logoValue = data.logo;
            let logoUrl = typeof logoValue === "string" ? logoValue : "";
            if (logoValue instanceof File) {
                logoUrl = (await uploadFile(logoValue)) || "";
                if (logoUrl) uploadedUrls.push(logoUrl);
            } else if (logoValue instanceof FileList && logoValue.length > 0) {
                logoUrl = (await uploadFile(logoValue[0])) || "";
                if (logoUrl) uploadedUrls.push(logoUrl);
            }
            if (!logoUrl) {
                setError("logo", {
                    type: "required",
                    message: "Logo is required",
                });
                return;
            }

            const newUrls: string[] = [];
            for (const file of Array.from((data.files as FileList) || [])) {
                const url = await uploadFile(file);
                if (url) {
                    newUrls.push(url);
                    uploadedUrls.push(url);
                }
            }
            const retainedUrls = existingFiles
                .map((file) => file.url)
                .filter(Boolean) as string[];

            await updateEventOrganizer({
                event_organizer_id: Number(eventOrganizerId),
                name: data.name,
                details: {
                    url: logoUrl,
                    urls: [...retainedUrls, ...newUrls],
                    links: [
                        ...existingLinks.map(({ title, url }) => ({
                            title,
                            url,
                        })),
                        ...parseLinks(data.links),
                    ],
                },
            }).unwrap();
            navigate(`/admin/event-organizers/${eventOrganizerId}`, {
                state: { success: "Event organizer updated successfully!" },
            });
        } catch (error) {
            await removeUploadedFiles(uploadedUrls);
            handleErrors(error, setError);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Edit Event Organizer - CU Portal"
                description="Edit an event organizer"
            />
            <SubBanner
                title="Edit Event Organizer"
                description="Update the event organizer details"
                icon="user"
                linkText="Back to Event Organizer"
                linkTo={`/admin/event-organizers/${eventOrganizerId}`}
            />
            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    className={styles.formCard}
                    disabled={busy}
                >
                    <div className={styles.formGroup}>
                        <Heading
                            icon="calendar"
                            content="Basic Information"
                            size="medium"
                        />
                        <Input
                            label="Event Organizer Name"
                            register={register}
                            name="name"
                            type="text"
                            placeholder="Enter organizer name"
                            errors={errors}
                            disabled={busy}
                        />
                    </div>
                    <div className={styles.attachmentsSection}>
                        <Heading icon="image" content="Logo" size="medium" />
                        <Thumbnail
                            register={register}
                            name="logo"
                            errors={errors}
                            setValue={setValue}
                            existingUrl={existingLogoUrl}
                            onRemoveExisting={() => setExistingLogoUrl(null)}
                            label="Logo"
                            required
                            logo
                            disabled={busy}
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
                            existingFiles={existingFiles}
                            setExistingFiles={setExistingFiles}
                            disabled={busy}
                        />
                        <LinksInputContainer
                            register={register}
                            name="links"
                            errors={errors}
                            setValue={setValue}
                            existingLinks={existingLinks}
                            setExistingLinks={setExistingLinks}
                            disabled={busy}
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button
                            text="Cancel"
                            loadingText="Cancelling..."
                            type="button"
                            isSubmitting={false}
                            onClick={() =>
                                navigate(
                                    `/admin/event-organizers/${eventOrganizerId}`,
                                )
                            }
                            isSecondary
                        />
                        <Button
                            text="Update Organizer"
                            loadingText="Updating..."
                            isSubmitting={busy}
                            type="submit"
                            isOrange={false}
                        />
                    </div>
                </Form>
            </main>
        </Layout>
    );
};
