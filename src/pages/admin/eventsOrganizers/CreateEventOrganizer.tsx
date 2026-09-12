import { useNavigate } from "react-router";
import { useState } from "react";
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
import { LinksInputContainer } from "../../../components/forms/LinksInputContainer";
import { Heading } from "../../../components/heading/Heading";
import { Button } from "../../../components/forms/Button";
import { useCreateEventOrganizerMutation } from "../../../services/apis/admin/EventOrganizerAPIs";
import {
    useUploadFileToDrive,
    useRemoveUploadedFiles,
} from "../../../hooks/useHandleProcesses";
import { handleErrors } from "../../../utils/ErrorHandling";
import styles from "./CreateEventOrganizer.module.css";

const schema = z.object({
    name: z.string().trim().min(1, "Organizer name is required"),
    logo: z.any().refine(
        (value) => value instanceof File || Boolean(value && typeof value === "object" && "length" in value && Number(value.length) > 0),
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
              .filter(
                  (link): link is { title: string; url: string } =>
                      Boolean(link.title && link.url),
              )
        : [];

export const CreateEventOrganizer = () => {
    const navigate = useNavigate();
    const [createEventOrganizer, { isLoading }] = useCreateEventOrganizerMutation();
    const uploadFile = useUploadFileToDrive({});
    const removeUploadedFiles = useRemoveUploadedFiles();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
    } = useForm<FormData>({ resolver: zodResolver(schema) });
    const [isUploading, setIsUploading] = useState(false);
    const busy = isSubmitting || isLoading || isUploading || uploadFile.isGoogleAccessTokenLoading;

    const onSubmit = async (data: FormData) => {
        const uploadedUrls: string[] = [];
        try {
            setIsUploading(true);
            const logoFile = data.logo instanceof File
                ? data.logo
                : (data.logo as FileList)?.[0];
            if (!logoFile) {
                setError("logo", { type: "required", message: "Logo is required" });
                return;
            }
            const logoUrl = await uploadFile(logoFile);
            if (logoUrl) uploadedUrls.push(logoUrl);
            if (!logoUrl) {
                setError("logo", { type: "upload", message: "Failed to upload logo" });
                return;
            }

            const urls: string[] = [];
            for (const file of Array.from((data.files as FileList) || [])) {
                const url = await uploadFile(file);
                if (url) {
                    urls.push(url);
                    uploadedUrls.push(url);
                }
            }

            await createEventOrganizer({
                name: data.name,
                details: {
                    url: logoUrl,
                    urls,
                    links: parseLinks(data.links),
                },
            }).unwrap();
            navigate("/admin/event-organizers", {
                state: { success: "Event organizer created successfully!" },
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
            <PageSeo title="Create Event Organizer - CU Portal" description="Create a new event organizer" />
            <SubBanner title="Create New Event Organizer" description="Add an event organizer and its resources" icon="user" linkText="Back to Event Organizers" linkTo="/admin/event-organizers" />
            <main className={styles.container}>
                <Form onSubmit={handleSubmit(onSubmit)} errors={errors} className={styles.formCard} disabled={busy}>
                    <div className={styles.formGroup}>
                        <Heading icon="calendar" content="Basic Information" size="medium" />
                        <Input label="Event Organizer Name" register={register} name="name" type="text" placeholder="Enter organizer name" errors={errors} disabled={busy} />
                    </div>

                    <div className={styles.attachmentsSection}>
                        <Heading icon="image" content="Logo" size="medium" />
                        <Thumbnail register={register} name="logo" errors={errors} setValue={setValue} label="Logo" required logo disabled={busy} />
                    </div>

                    <div className={styles.attachmentsSection}>
                        <Heading icon="paperclip" content="Attachments & Links" size="medium" />
                        <FilesInputContainer register={register} name="files" errors={errors} setValue={setValue} disabled={busy} />
                        <LinksInputContainer register={register} name="links" errors={errors} setValue={setValue} disabled={busy} />
                    </div>

                    <div className={styles.formActions}>
                        <Button text="Cancel" loadingText="Cancelling..." type="button" isSubmitting={false} onClick={() => navigate("/admin/event-organizers")} isSecondary />
                        <Button text="Create Event Organizer" loadingText="Creating..." isSubmitting={busy} type="submit" isOrange={false} />
                    </div>
                </Form>
            </main>
        </Layout>
    );
};
