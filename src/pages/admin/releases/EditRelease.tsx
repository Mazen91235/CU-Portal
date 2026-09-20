import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { getRedirectUrl } from "../../../utils/Navigation";
import { Button } from "../../../components/forms/Button";
import { DateInput } from "../../../components/forms/DateInput";
import { Form } from "../../../components/forms/Form";
import { Input } from "../../../components/forms/Input";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Heading } from "../../../components/heading/Heading";
import { ReleaseItems } from "../../../components/releases/ReleaseItems";
import { PageSeo } from "../../../components/PageSeo";
import type { ReleaseItemMutationDto } from "../../../types/dtos/ReleaseItemDtos";
import {
    useLazyGetReleaseQuery,
    useUpdateReleaseMutation,
} from "../../../services/apis/admin/ReleaseAPIs";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { getErrorMessage, handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import { toIsoFormat } from "../../../utils/Formatter";
import styles from "./EditRelease.module.css";

type ReleaseFormData = Record<string, unknown> & {
    release_number: string;
    title: string;
    date: string;
    description: string;
    release_items: ReleaseItemMutationDto[];
};

export const EditRelease = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = getRedirectUrl(searchParams.get("redirect_url"), "/admin/releases");
    const { releaseId } = useParams<{ releaseId: string }>();
    const [getRelease] = useLazyGetReleaseQuery();
    const [updateRelease, { isLoading }] = useUpdateReleaseMutation();
    const [defaultItems, setDefaultItems] = useState<ReleaseItemMutationDto[]>(
        [],
    );
    const form = useForm<ReleaseFormData>({
        defaultValues: {
            release_number: "",
            title: "",
            date: "",
            description: "",
            release_items: [{ item_type: "Feature", content: "" }],
        },
    });
    const { register, control, handleSubmit, reset, setValue } = form;
    const { errors, isSubmitting } = form.formState;
    const busy = isSubmitting || isLoading;

    const fetchRelease = useCallback(async () => {
        if (!releaseId) return;
        try {
            const result = await getRelease({
                release_id: Number(releaseId),
            }).unwrap();
            const release = result.data;
            if (!release) {
                navigate(redirectUrl, {
                    state: { error: "Failed to fetch release" },
                });
                return;
            }
            const items = (release.release_items ?? []).map((item) => ({
                item_type: item.item_type ?? "Feature",
                content: item.content ?? "",
            }));
            setDefaultItems(items);
            reset({
                release_number: release.release_number ?? "",
                title: release.title ?? "",
                date: release.date ?? "",
                description: release.details?.description ?? "",
                release_items: items,
            });
        } catch (error) {
            navigate(redirectUrl, {
                state: { error: getErrorMessage(error) || "Failed to fetch release" },
            });
        }
    }, [getRelease, navigate, releaseId, reset, redirectUrl]);

    useAuthQuery(fetchRelease);

    const onSubmit = async (data: ReleaseFormData) => {
        if (!releaseId) return;
        try {
            await updateRelease({
                release_id: Number(releaseId),
                id: Number(releaseId),
                details: { description: data.description },
                ...data,
                date: toIsoFormat(data.date) || "",
            }).unwrap();
            showToast("success", "Success", "Release updated successfully");
            navigate(redirectUrl);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Edit Release - CU Portal"
                description="Edit release information and updates"
            />
            <SubBanner
                title="Edit Release"
                description="Update release information and release updates"
                icon="user"
                linkText="Back to Releases"
                linkTo={redirectUrl}
            />
            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    className={styles.formCard}
                    disabled={busy}
                >
                    <Heading
                        icon="edit"
                        content="Release Information"
                        size="medium"
                    />
                    <div className={styles.formGrid}>
                        <Input
                            label="Release Number"
                            register={register}
                            name="release_number"
                            type="text"
                            placeholder="e.g. v1.0.0"
                            errors={errors}
                            disabled={busy}
                        />
                        <Input
                            label="Title"
                            register={register}
                            name="title"
                            type="text"
                            placeholder="Release title"
                            errors={errors}
                            disabled={busy}
                        />
                        <DateInput
                            label="Release Date"
                            register={register}
                            name="date"
                            errors={errors}
                            setValue={setValue}
                            control={control}
                            disabled={busy}
                        />
                    </div>
                    <div className={styles.descriptionSection}>
                        <Input
                            label="Description"
                            register={register}
                            name="description"
                            type="text"
                            placeholder="Describe this release..."
                            errors={errors}
                            disabled={busy}
                            isTextArea
                        />
                    </div>
                    <ReleaseItems
                        register={register}
                        name="release_items"
                        errors={errors}
                        setValue={setValue}
                        defaultItems={defaultItems}
                        disabled={busy}
                    />
                    <div className={styles.formActions}>
                        <Button
                            text="Cancel"
                            loadingText="Cancelling..."
                            type="button"
                            isSubmitting={false}
                            onClick={() => navigate(redirectUrl)}
                            isSecondary
                        />
                        <Button
                            text="Save Changes"
                            loadingText="Saving..."
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
