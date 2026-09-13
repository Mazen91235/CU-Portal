import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/forms/Button";
import { DateInput } from "../../../components/forms/DateInput";
import { Form } from "../../../components/forms/Form";
import { Input } from "../../../components/forms/Input";
import { Heading } from "../../../components/heading/Heading";
import { ReleaseItems } from "../../../components/releases/ReleaseItems";
import type { ReleaseItemMutationDto } from "../../../types/dtos/ReleaseItemDtos";
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
      date: "",
      description: "",
      release_items: [{ item_type: "Feature", content: "" }],
    },
  });

  const onSubmit = (data: ReleaseFormData) => {
    console.log("Release form data", data);
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
              text="Create Release"
              loadingText="Creating..."
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
