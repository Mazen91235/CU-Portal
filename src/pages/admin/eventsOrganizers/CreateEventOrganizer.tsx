import { Layout } from "../../../components/layout/Layout";
import styles from "./CreateEventOrganizer.module.css";
import { PageSeo } from "../../../components/PageSeo";
import { GetIcon } from "../../../utils/LinkHandler";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Form } from "../../../components/forms/Form";
import { Input } from "../../../components/forms/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod/src/index.js";
import { z } from "zod";
import { LinksInputContainer } from "../../../components/forms/LinksInputContainer";
import { Heading } from "../../../components/heading/Heading";
import { Button } from "../../../components/forms/Button";
import { useNavigate } from "react-router";
import { useState } from "react";
import { LogoInputContainer } from "../../../components/forms/LogoInputContainer";
import { useCreateEventOrganizerMutation } from "../../../services/apis/admin/EventOrganizerAPI";
import { handlePopupErrors } from "../../../utils/ErrorHandling";

const organizerSchema = z.object({
  name: z.string().min(1, "Organizer name is required"),
  logo: z.any().optional(),
  links: z.string().optional(),
});

type OrganizerFormData = z.infer<typeof organizerSchema>;

export const CreateEventOrganizer = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<OrganizerFormData>({
    resolver: zodResolver(organizerSchema),
  });
  const navigate = useNavigate();
  const [createEventOrganizer, { isLoading }] =
    useCreateEventOrganizerMutation();
  const [currentLogo, setCurrentLogo] = useState<string>("");
  const isSubmitting = isLoading;
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    navigate("/admin/eventsOrganizers");
  };
  return (
    <Layout>
      <PageSeo
        title="Create Event Organizer - CU Portal"
        description="Create a new event organizer in the CU Portal"
      />
      <SubBanner
        title="Create New Event Organizer"
        description="Fill in the details below to create a new event organizer"
        icon={GetIcon("user")}
        linkText="Back to Event Organizers"
        linkTo="/admin/eventsOrganizers"
      />
      <main className={styles.container}>
        <Form
          onSubmit={handleSubmit(async (data) => {
            try {
              await createEventOrganizer({
                name: data.name,
                logo: currentLogo || undefined,
                attached_links: data.links
                  ?.split(",")
                  .map((link) => link.trim())
                  .filter(Boolean),
              }).unwrap();
              navigate("/admin/eventsOrganizers");
            } catch (error) {
              handlePopupErrors(error);
            }
          })}
          errors={errors}
          className={styles.formCard}
        >
          <div className={styles.formGroup}>
            <Heading
              icon="calendar"
              content="Basic Information"
              size="medium"
            />
            <Input<OrganizerFormData>
              label="Event Organizer Name"
              register={register}
              placeholder="Enter organizer name"
              name="name"
              type="text"
              errors={errors}
            />
          </div>

          <div className={styles.attachmentsSection}>
            <Heading icon="image" content="Logo" size="medium" />
            <LogoInputContainer
              register={register}
              name="logo"
              currentLogo={currentLogo}
              onChange={handleLogoChange}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.attachmentsSection}>
            <Heading
              icon="paperclip"
              content="Attachments & Links"
              size="medium"
            />
            <LinksInputContainer
              register={register}
              name="links"
              errors={errors}
              setValue={setValue}
              disabled={isLoading}
              linkTitleOptions={["Facebook", "Twitter", "Instagram"]}
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
              text="Create Event Organizer"
              loadingText="Creating..."
              isSubmitting={isLoading}
              type="submit"
              isOrange={false}
            />
          </div>
        </Form>
      </main>
    </Layout>
  );
};
