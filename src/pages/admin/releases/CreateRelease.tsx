import { useState } from "react";
import { getRedirectUrl } from "../../../utils/Navigation";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/forms/Button";
import { DateInput } from "../../../components/forms/DateInput";
import { Form } from "../../../components/forms/Form";
import { Input } from "../../../components/forms/Input";
import { Heading } from "../../../components/heading/Heading";
import { ReleaseItems } from "../../../components/releases/ReleaseItems";
import type { ReleaseItemMutationDto } from "../../../types/dtos/ReleaseItemDtos";
import { useCreateReleaseMutation } from "../../../services/apis/admin/ReleaseAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import styles from "./CreateRelease.module.css";

type ReleaseFormData = Record<string, unknown> & {
    release_number: string;
    title: string;
    date: string;
    description: string;
    release_items: ReleaseItemMutationDto[];
};

export const CreateRelease = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = getRedirectUrl(
        searchParams.get("redirect_url"),
        "/admin/releases",
    );
    const [createRelease, { isLoading }] = useCreateReleaseMutation();
    const [defaultDate] = useState(() =>
        new Date().toLocaleDateString("en-CA"),
    );
    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ReleaseFormData>({
        defaultValues: {
            release_number: "",
            title: "",
            date: defaultDate,
            description: "",
            release_items: [{ item_type: "Feature", content: "" }],
        },
    });
    const busy = isSubmitting || isLoading;

    const onSubmit = async (data: ReleaseFormData) => {
        try {
            await createRelease(data).unwrap();
            showToast("success", "Success", "Release created successfully");
            navigate(redirectUrl);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Create Release - CU Portal"
                description="Create a new release"
            />
            <SubBanner
                title="Create New Release"
                description="Add a new release to the system"
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
                            placeholder="e.g. 1.0.0"
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
                            text="Create Release"
                            loadingText="Creating..."
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
