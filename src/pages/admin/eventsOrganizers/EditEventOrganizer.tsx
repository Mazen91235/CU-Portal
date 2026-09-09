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
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { LogoInputContainer } from "../../../components/forms/LogoInputContainer";
import {
  useLazyGetEventOrganizerQuery,
  useUpdateEventOrganizerMutation,
} from "../../../services/apis/admin/EventOrganizerAPI";
import type { EventOrganizer } from "../../../types/entities/EventOrganizer";
import { handlePopupErrors } from "../../../utils/ErrorHandling";

const organizerSchema = z.object({
  name: z.string().min(1, "Organizer name is required"),
  logo: z.any().optional(),
  links: z.string().optional(),
});

type OrganizerFormData = z.infer<typeof organizerSchema>;

export const EditEventOrganizer = () => {
  const { organizerId } = useParams<{ organizerId: string }>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<OrganizerFormData>({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      name: "",
      links: "",
    },
  });

  const [currentLogo, setCurrentLogo] = useState<string>("");
  const [organizer, setOrganizer] = useState<EventOrganizer | null>(null);
  const [getEventOrganizer] = useLazyGetEventOrganizerQuery();
  const [updateEventOrganizer, { isLoading }] =
    useUpdateEventOrganizerMutation();

  // Load organizer data on mount
  useEffect(() => {
    if (organizerId) {
      getEventOrganizer({ event_organizer_id: Number(organizerId) })
        .unwrap()
        .then((result) => {
          const data = result.data;
          setOrganizer(data || null);
          setValue("name", data?.name || "");
          setValue("links", data?.attached_links?.join(", ") || "");
          setCurrentLogo(data?.logo || "");
        })
        .catch(handlePopupErrors);
    }
  }, [organizerId, getEventOrganizer, setValue]);

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
    navigate(`/admin/eventsOrganizers/${organizerId}`);
  };

  const onSubmit = async (data: OrganizerFormData) => {
    if (!organizerId || !organizer) return;
    try {
      await updateEventOrganizer({
        event_organizer_id: Number(organizerId),
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
  };

  return (
    <Layout>
      <PageSeo
        title="Edit Event Organizer - CU Portal"
        description="Edit an existing event organizer in the CU Portal"
      />
      <SubBanner
        title="Edit Event Organizer"
        description="Update the details below to modify the event organizer"
        icon={GetIcon("user")}
        linkText="Back to Event Organizers"
        linkTo="/admin/eventsOrganizers"
      />
      <main className={styles.container}>
        <Form
          onSubmit={handleSubmit(onSubmit)}
          errors={errors}
          className={styles.formCard}
        >
          {/* Basic Information Section */}
          <div className={styles.formGroup}>
            <Heading
              icon="calendar"
              content="Basic Information"
              size="medium"
            />
            <Input<OrganizerFormData>
              label="Organizer Name "
              register={register}
              placeholder="Enter organizer name"
              name="name"
              type="text"
              errors={errors}
              registerOptions={{
                required: "Name is required",
              }}
            />
          </div>

          {/* Logo Section */}
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

          {/* Attachments & Links Section */}
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
              disabled={isSubmitting}
              defaultValue={organizer?.attached_links?.join(", ")}
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
              text="Update Organizer"
              loadingText="Updating..."
              isSubmitting={isSubmitting || isLoading}
              type="submit"
              isOrange={false}
            />
          </div>
        </Form>
      </main>
    </Layout>
  );
};
