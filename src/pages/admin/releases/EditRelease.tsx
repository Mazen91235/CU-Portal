import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
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
import styles from "./EditRelease.module.css";

type ReleaseFormData = Record<string, unknown> & {
  release_number: string;
  title: string;
  date: string;
  description: string;
  release_items: ReleaseItemMutationDto[];
};

const releaseToEdit: ReleaseFormData = {
  release_number: "v1.0.0",
  title: "CU Portal v1.0.0",
  date: "2024-06-01",
  description:
    "Initial release of CU Portal with core features and improvements.",
  release_items: [
    {
      item_type: "Feature",
      content: "Added new feature to enhance user experience.",
    },
    {
      item_type: "Improvement",
      content: "Improved performance and stability of the application.",
    },
    {
      item_type: "Security Fix",
      content: "Strengthened release security and validation.",
    },
  ],
};

export const EditRelease = () => {
  const navigate = useNavigate();
  const { releaseId } = useParams<{ releaseId: string }>();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReleaseFormData>({
    defaultValues: releaseToEdit,
  });

  const onSubmit = (data: ReleaseFormData) => {
    console.log("Updated release", { releaseId, ...data });
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
        linkTo="/admin/releases"
      />
      <main className={styles.container}>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          errors={errors}
          className={styles.formCard}
          disabled={isSubmitting}
        >
          <Heading icon="edit" content="Release Information" size="medium" />
          <div className={styles.formGrid}>
            <Input
              label="Release Number"
              register={register}
              name="release_number"
              type="text"
              placeholder="e.g. v1.0.0"
              errors={errors}
              disabled={isSubmitting}
            />
            <Input
              label="Title"
              register={register}
              name="title"
              type="text"
              placeholder="Release title"
              errors={errors}
              disabled={isSubmitting}
            />
            <DateInput
              label="Release Date"
              register={register}
              name="date"
              errors={errors}
              setValue={setValue}
              control={control}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              isTextArea
            />
          </div>

          <ReleaseItems
            register={register}
            name="release_items"
            errors={errors}
            setValue={setValue}
            defaultItems={releaseToEdit.release_items}
            disabled={isSubmitting}
          />

          <div className={styles.formActions}>
            <Button
              text="Cancel"
              loadingText="Cancelling..."
              type="button"
              isSubmitting={false}
              onClick={() => navigate("/admin/releases")}
              isSecondary
            />
            <Button
              text="Save Changes"
              loadingText="Saving..."
              isSubmitting={isSubmitting}
              type="submit"
              isOrange={false}
            />
          </div>
        </Form>
      </main>
    </Layout>
  );
};
