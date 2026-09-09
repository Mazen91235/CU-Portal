import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { DateInput } from "../../../components/forms/DateInput";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { Form } from "../../../components/forms/Form";
import { Heading } from "../../../components/heading/Heading";
import { GetIcon } from "../../../utils/LinkHandler";
import { Thumbnail } from "../../../components/forms/Thumbnail";
import { FilesInputContainer } from "../../../components/forms/FilesInputContainer";
import { LinksInputContainer } from "../../../components/forms/LinksInputContainer";

import { handlePopupErrors } from "../../../utils/ErrorHandling";
import styles from "./CreateEvent.module.css";

const eventSchema = z.object({
    title: z.string().min(1, "Event name is required"),
    thumbnail: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    instructions: z.string().min(1, "Instruction is required"),
    event_date: z.string().min(1, "Event date is required"),
    event_time: z.string().min(1, "Event time is required"),
    event_type: z.string().min(1, "Event type is required"),
    event_link: z.string().min(1, "Event link is required"),
    price: z.string().min(1, "Price is required"),    
    files: z.any().optional(),
    links: z.string().optional(),
    // Access Permissions
    is_restricted: z.boolean().default(false),
    faculty_id: z.string().optional(),
    department_id: z.string().optional(),
    year_level: z.string().optional(),
});

type EventFormData = z.input<typeof eventSchema>;

export const CreateEvent = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
    });

    const isRestricted = watch("is_restricted");

    const onSubmit = async (data: EventFormData) => {
        try {
            setIsLoading(true);
            setIsUploading(true);
            // Format data payload for API
            console.log("Form Submitted:", data);            
            navigate("/admin/events", {
                state: { success: "Event created successfully!" },
            });
        } catch (error) {
            handlePopupErrors(error);
        } finally {
            setIsLoading(false);
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/events");
    };

    return (
        <Layout>
            <PageSeo
                title="Create New Event | CU Portal"
                description="Fill in the details to create your event"
            />
            <SubBanner
                title="Create New Event"
                description="Fill in the details to create your event"
                icon={GetIcon("calendar")} 
                linkText="Back to Events"
                linkTo="/admin/events"
            />
            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    className={styles.formCard}
                >
                    <div className={styles.formSection}>
                        <Heading
                            icon="calendar-alt" // Or "clipboard-list"
                            content="Basic Information"
                            size="medium"
                        />
                        <Input
                            label="Event Name *"
                            placeholder="Enter event name"
                            register={register}
                            name="title"
                            type="text"
                            errors={errors}
                            disabled={isLoading}
                        />
                        
                        <Thumbnail />

                        <Input
                            label="Description *"
                            type="textarea"
                            placeholder="Describe your event..."
                            register={register}
                            name="description"
                            errors={errors}
                            disabled={isLoading}
                            isTextArea
                        />
                        <Input
                            label="Instruction *"
                            type="textarea"
                            placeholder="Write clear guidelines students must follow during the event"
                            register={register}
                            name="instructions"
                            errors={errors}
                            disabled={isLoading}
                            isTextArea
                        />
                    </div>

                    <div className={styles.formSection}>
                        <Heading
                            icon="clock"
                            content="Date & Time"
                            size="medium"
                        />
                        <div className={styles.dateTimeGroup}>
                            <DateInput
                                label="Event Date *"
                                register={register}
                                name="event_date"
                                errors={errors}
                                setValue={setValue}
                                control={control}
                                disabled={isLoading}
                            />
                            <Input
                                label="Event Time *"
                                type="time"
                                register={register}
                                name="event_time"
                                errors={errors}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <Heading
                            icon="map-marker-alt"
                            content="Location"
                            size="medium"
                        />
                        <Select
                            label="Event Type *"
                            register={register}
                            name="event_type"
                            errors={errors}
                            disabled={isLoading}
                        >
                            <option value="Online Event">Online Event</option>
                            <option value="In-Person">Offline</option>
                            <option value="Hybrid">Hybrid</option>
                        </Select>
                        <Input
                            label="Event Link *"
                            placeholder="https://zoom.us/j/..."
                            register={register}
                            name="event_link"
                            type="url"
                            errors={errors}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formSection}>
                        <Heading
                            icon="dollar-sign"
                            content="Pricing"
                            size="medium"
                        />
                        <Input
                            label="Price (EGP) *"
                            placeholder="Enter price (0 for free)"
                            register={register}
                            name="price"
                            type="number"
                            errors={errors}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={`${styles.attachmentsSection} ${styles.formSection}`}>
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

                    <div className={`${styles.formSection} ${styles.accessPermissionsSection}`}>
                        <Heading
                            icon="users"
                            content="Access Permissions (Optional)"
                            size="medium"
                        />
                        
                        <div className={styles.toggleRow}>
                            <label className={styles.customLabel}>Restricted Event?</label>
                            <label className={styles.switch}>
                                <input type="checkbox" {...register("is_restricted")} />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        {isRestricted &&
                            <>
                                <Select
                                label="Faculty"
                                register={register}
                                name="faculty_id"
                                errors={errors}
                                disabled={isLoading}
                                >
                                    <option value="">e.g., Computer Science</option>
                                    <option value="1">Computer Science</option>
                                </Select>

                                <Select
                                label="Department"
                                register={register}
                                name="department_id"
                                errors={errors}
                                disabled={isLoading}
                                >
                                    <option value="">e.g., Software Engineering</option>
                                    <option value="1">Software Engineering</option>
                                </Select>

                                <Select
                                label="Year Level"
                                register={register}
                                name="year_level"
                                errors={errors}
                                disabled={isLoading}
                                >
                                    <option value="">e.g., 3rd Year</option>
                                    <option value="3">3rd Year</option>
                                </Select>
                            </>
                        }
                    </div>

                    <div className={styles.formActions}>
                        <Button
                            text="Cancel"
                            loadingText=""
                            isSubmitting={false}
                            onClick={handleCancel}
                            type="default"
                            isDefault
                        />
                        <Button
                            text="Create Event"
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