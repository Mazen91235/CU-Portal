import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetEventQuery,
    useUpdateEventMutation,
} from "../../../services/apis/admin/EventAPIs";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { useLazyGetEventOrganizersQuery } from "../../../services/apis/admin/EventOrganizerAPIs";
import type { EventResponseDto } from "../../../types/dtos/EventDtos";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import type { EventOrganizerResponseDto } from "../../../types/dtos/EventOrganizerDtos";
import type { LinkData } from "../../../types/entities/Task";
import type { FileDataWithExisting } from "../../../types/entities/Attachment";
import { useAppSelector } from "../../../services/redux/Hooks";
import useAuthQuery from "../../../hooks/useAuthQuery";
import {
    useUploadFileToDrive,
    useRemoveUploadedFiles,
} from "../../../hooks/useHandleProcesses";
import { handleErrors, handlePopupErrors } from "../../../utils/ErrorHandling";
import {
    formatDateInputValue,
    formatTimeInputValue,
    mergeDateAndTime,
} from "../../../utils/Formatter";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { DateInput } from "../../../components/forms/DateInput";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { Form } from "../../../components/forms/Form";
import { Heading } from "../../../components/heading/Heading";
import { Thumbnail } from "../../../components/forms/Thumbnail";
import { FilesInputContainer } from "../../../components/forms/FilesInputContainer";
import { LinksInputContainer } from "../../../components/forms/LinksInputContainer";
import styles from "./EditEvent.module.css";

const eventSchema = z
    .object({
        title: z.string().min(1, "Event title is required"),
        thumbnail: z.any().optional(),
        description: z.string().min(1, "Description is required"),
        start_date: z.string().min(1, "Start date is required"),
        start_time: z.string().min(1, "Start time is required"),
        end_date: z.string().optional(),
        end_time: z.string().optional(),
        location_type: z.enum(["Online", "Offline"]),
        location: z.string().min(1, "Location is required"),
        price: z.string().min(1, "Price is required"),
        event_organizer_id: z.string().min(1, "Event organizer is required"),
        files: z.any().optional(),
        links: z.string().optional(),
        is_restricted: z.boolean().default(false),
        faculty_id: z.string().optional(),
        department_id: z.string().optional(),
        year_id: z.string().optional(),
    })
    .refine(
        (data) => {
            if (!data.end_date) return true;
            const start = mergeDateAndTime(data.start_date, data.start_time);
            const end = mergeDateAndTime(
                data.end_date,
                data.end_time || "00:00",
            );
            return !start || !end || end >= start;
        },
        {
            message: "End date and time must be after the start date and time",
            path: ["end_date"],
        },
    );

type EventFormData = z.input<typeof eventSchema>;

export const EditEvent = () => {
    const navigate = useNavigate();
    const { eventId } = useParams<{ eventId: string }>();
    const user = useAppSelector((state) => state.user.user);

    const [event, setEvent] = useState<EventResponseDto | null>(null);
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);
    const [organizers, setOrganizers] = useState<EventOrganizerResponseDto[]>(
        [],
    );
    const [existingFiles, setExistingFiles] = useState<FileDataWithExisting[]>(
        [],
    );
    const [existingLinks, setExistingLinks] = useState<LinkData[]>([]);
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
        string | null
    >(null);
    const [isUploading, setIsUploading] = useState(false);

    const [getEvent] = useLazyGetEventQuery();
    const [updateEvent, { isLoading }] = useUpdateEventMutation();
    const [getFaculties] = useLazyGetFacultiesQuery();
    const [getDepartments] = useLazyGetDepartmentsQuery();
    const [getYears] = useLazyGetYearsQuery();
    const [getOrganizers] = useLazyGetEventOrganizersQuery();
    const uploadFile = useUploadFileToDrive({});
    const removeUploadedFiles = useRemoveUploadedFiles();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
        watch,
    } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
    });

    const isRestricted = watch("is_restricted");
    const selectedFaculty = watch("faculty_id");
    const busy = isSubmitting || isLoading || isUploading;

    const fetchFaculties = useCallback(async () => {
        if (!user?.canAccessAll) return;
        try {
            const result = await getFaculties({ data: {} }).unwrap();
            setFaculties(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getFaculties, user?.canAccessAll]);

    const fetchDepartments = useCallback(async () => {
        if (!user?.canAccessAll || !selectedFaculty) {
            setDepartments([]);
            return;
        }

        try {
            const result = await getDepartments({
                data: {
                    faculty_id: parseInt(selectedFaculty),
                    study_type: undefined,
                },
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartments, selectedFaculty, user?.canAccessAll]);

    const fetchYears = useCallback(async () => {
        if (!user?.canAccessAll) return;
        try {
            const result = await getYears({ data: {} }).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getYears, user?.canAccessAll]);

    const fetchOrganizers = useCallback(async () => {
        try {
            const result = await getOrganizers({ data: {} }).unwrap();
            setOrganizers(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getOrganizers]);

    const fetchEvent = useCallback(async () => {
        if (!eventId) return;

        try {
            const result = await getEvent({
                event_id: parseInt(eventId),
            }).unwrap();

            const eventData = result.data || null;
            setEvent(eventData);

            if (!eventData) return;

            setValue("title", eventData.title || "");
            setValue("description", eventData.details?.description || "");
            setValue("start_date", formatDateInputValue(eventData.start_date));
            setValue("start_time", formatTimeInputValue(eventData.start_date));
            setValue("end_date", formatDateInputValue(eventData.end_date));
            setValue("end_time", formatTimeInputValue(eventData.end_date));
            setValue("location_type", eventData.location_type || "Offline");
            setValue("location", eventData.location || "");
            setValue("price", eventData.price?.toString() || "0");
            setValue(
                "event_organizer_id",
                eventData.event_organizer?.id?.toString() || "",
            );

            const restricted = Boolean(
                eventData.faculty?.id ||
                eventData.department?.id ||
                eventData.year?.id,
            );
            setValue("is_restricted", restricted);
            setValue("faculty_id", eventData.faculty?.id?.toString() || "");
            setValue(
                "department_id",
                eventData.department?.id?.toString() || "",
            );
            setValue("year_id", eventData.year?.id?.toString() || "");

            setExistingThumbnailUrl(eventData.logo?.url || null);
            setExistingFiles(
                eventData.attachments
                    ?.filter((attachment) => attachment.is_file)
                    .map((attachment) => ({
                        ...(attachment.details?.file_data || {}),
                        url: attachment.url || "",
                        isExisting: true,
                    }))
                    .filter((file) => !!file.url) || [],
            );
            setExistingLinks(
                eventData.attachments
                    ?.filter((attachment) => !attachment.is_file)
                    .map((attachment) => ({
                        title:
                            attachment.details?.link_title || "Untitled Link",
                        url: attachment.url || "",
                    }))
                    .filter((link) => !!link.url) || [],
            );
        } catch (error) {
            const err = error as {
                data?: { message?: string };
            };
            navigate("/admin/events", {
                state: {
                    error: err.data?.message || "Failed to fetch event",
                },
            });
        }
    }, [eventId, getEvent, navigate, setValue]);

    const authQueryParams = useCallback(
        () =>
            Promise.all([
                fetchEvent(),
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
                fetchOrganizers(),
            ]),
        [
            fetchEvent,
            fetchFaculties,
            fetchDepartments,
            fetchYears,
            fetchOrganizers,
        ],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        if (!user?.canAccessAll && isRestricted) {
            setValue("faculty_id", user?.faculty?.id?.toString() || "");
            setValue("department_id", user?.department?.id?.toString() || "");
            setValue("year_id", user?.year?.id?.toString() || "");
            setFaculties(user?.faculty ? [user.faculty] : []);
            setDepartments(user?.department ? [user.department] : []);
            setYears(user?.year ? [user.year] : []);
            return;
        }

        if (!isRestricted) {
            setValue("faculty_id", "");
            setValue("department_id", "");
            setValue("year_id", "");
            if (!user?.canAccessAll) {
                setFaculties([]);
                setDepartments([]);
                setYears([]);
            }
        }
    }, [isRestricted, user, setValue]);

    useEffect(() => {
        if (user?.canAccessAll) {
            setValue("department_id", "");
        }
    }, [selectedFaculty, setValue, user?.canAccessAll]);

    const uploadFiles = async (files: FileList): Promise<string[]> => {
        const urls: string[] = [];

        for (const file of Array.from(files)) {
            const url = await uploadFile(file);
            if (url) urls.push(url);
        }

        return urls;
    };

    const parseLinks = (value?: string): LinkData[] =>
        value
            ? (value
                  .split(",")
                  .map((pair) => {
                      const [title, url] = pair.split("|");
                      return {
                          title: title?.trim(),
                          url: url?.trim(),
                      };
                  })
                  .filter((link) => link.title && link.url) as LinkData[])
            : [];

    const getThumbnailFile = (
        value: EventFormData["thumbnail"],
    ): File | undefined => {
        if (value instanceof File) return value;
        if (
            typeof FileList !== "undefined" &&
            value instanceof FileList &&
            value.length > 0
        ) {
            return value[0];
        }
        return undefined;
    };

    const onSubmit = async (data: EventFormData) => {
        if (!eventId) return;
        const uploadedUrls: string[] = [];

        const thumbnailFile = getThumbnailFile(data.thumbnail);
        if (!thumbnailFile && !existingThumbnailUrl) {
            setError("thumbnail", {
                type: "required",
                message: "Thumbnail is required",
            });
            return;
        }

        try {
            setIsUploading(true);

            const uploadedFiles =
                data.files && (data.files as FileList).length > 0
                    ? await uploadFiles(data.files as FileList)
                    : [];
            uploadedFiles.forEach((url) => uploadedUrls.push(url));

            const newThumbnailUrl = thumbnailFile
                ? await uploadFile(thumbnailFile)
                : undefined;
            if (newThumbnailUrl) uploadedUrls.push(newThumbnailUrl);

            const fileUrls = [
                ...existingFiles
                    .map((file) => file.url)
                    .filter((url): url is string => Boolean(url)),
                ...uploadedFiles,
            ];

            const links = [...existingLinks, ...parseLinks(data.links)];

            const scopedIds = user?.canAccessAll
                ? data.is_restricted
                    ? {
                          faculty_id: data.faculty_id
                              ? parseInt(data.faculty_id)
                              : undefined,
                          department_id: data.department_id
                              ? parseInt(data.department_id)
                              : undefined,
                          year_id: data.year_id
                              ? parseInt(data.year_id)
                              : undefined,
                      }
                    : {
                          faculty_id: undefined,
                          department_id: undefined,
                          year_id: undefined,
                      }
                : data.is_restricted
                  ? {
                        faculty_id: user?.faculty?.id ?? undefined,
                        department_id: user?.department?.id ?? undefined,
                        year_id: user?.year?.id ?? undefined,
                    }
                  : {
                        faculty_id: undefined,
                        department_id: undefined,
                        year_id: undefined,
                    };

            const payload = {
                event_id: parseInt(eventId),
                title: data.title,
                start_date:
                    mergeDateAndTime(
                        data.start_date,
                        data.start_time,
                    )?.toISOString() || "",
                end_date: data.end_date
                    ? mergeDateAndTime(
                          data.end_date,
                          data.end_time || "00:00",
                      )?.toISOString() || null
                    : null,
                price: parseFloat(data.price),
                location_type: data.location_type,
                location: data.location,
                event_organizer_id: parseInt(data.event_organizer_id),
                ...scopedIds,
                details: {
                    description: data.description || undefined,
                    url: newThumbnailUrl || existingThumbnailUrl || undefined,
                    urls: fileUrls.length ? fileUrls : undefined,
                    links: links.length ? links : undefined,
                },
            };

            await updateEvent(payload).unwrap();

            navigate("/admin/events", {
                state: { success: "Event updated successfully!" },
            });
        } catch (error) {
            await removeUploadedFiles(uploadedUrls);
            handleErrors(error, setError);
        } finally {
            setIsUploading(false);
        }
    };

    const facultyOptions = useMemo(
        () =>
            faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id || ""}>
                    {faculty.name}
                </option>
            )),
        [faculties],
    );

    const departmentOptions = useMemo(
        () =>
            departments.map((department) => (
                <option key={department.id} value={department.id || ""}>
                    {department.name}
                </option>
            )),
        [departments],
    );

    const yearOptions = useMemo(
        () =>
            years.map((year) => (
                <option key={year.id} value={year.id || ""}>
                    {year.year}
                </option>
            )),
        [years],
    );

    const organizerOptions = useMemo(
        () =>
            organizers.map((organizer) => (
                <option key={organizer.id} value={organizer.id || ""}>
                    {organizer.name}
                </option>
            )),
        [organizers],
    );

    if (!event) return null;

    return (
        <Layout>
            <PageSeo
                title={`Edit ${event.title || "Event"} | CU Portal`}
                description="Update event information"
            />
            <SubBanner
                title={`Edit ${event.title || "Event"}`}
                description="Update event information"
                icon="calendar"
                img={existingThumbnailUrl || undefined}
                linkText="Back to Events"
                linkTo="/admin/events"
            />

            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    disabled={busy}
                    className={styles.formCard}
                >
                    <div className={styles.formSection}>
                        <Heading
                            icon="info-circle"
                            content="Basic Information"
                            size="medium"
                        />
                        <Input
                            label="Event Title"
                            placeholder="Enter event title"
                            register={register}
                            name="title"
                            type="text"
                            errors={errors}
                            disabled={busy}
                        />

                        <Thumbnail
                            register={register}
                            name="thumbnail"
                            required
                            errors={errors}
                            setValue={setValue}
                            existingUrl={existingThumbnailUrl}
                            onRemoveExisting={() =>
                                setExistingThumbnailUrl(null)
                            }
                            disabled={busy}
                        />

                        <Input
                            label="Description"
                            type="textarea"
                            placeholder="Describe the event..."
                            register={register}
                            name="description"
                            errors={errors}
                            disabled={busy}
                            isTextArea
                        />

                        <Select
                            label="Event Organizer"
                            register={register}
                            name="event_organizer_id"
                            errors={errors}
                            disabled={busy}
                        >
                            <option value="">Select event organizer</option>
                            {organizerOptions}
                        </Select>
                    </div>

                    <div className={styles.formSection}>
                        <Heading
                            icon="clock"
                            content="Date & Time"
                            size="medium"
                        />
                        <div className={styles.dateTimeGroup}>
                            <DateInput
                                label="Start Date"
                                register={register}
                                name="start_date"
                                errors={errors}
                                setValue={setValue}
                                control={control}
                                disabled={busy}
                            />
                            <Input
                                label="Start Time"
                                register={register}
                                name="start_time"
                                type="time"
                                errors={errors}
                                disabled={busy}
                            />
                            <DateInput
                                label="End Date"
                                register={register}
                                name="end_date"
                                errors={errors}
                                setValue={setValue}
                                control={control}
                                disabled={busy}
                            />
                            <Input
                                label="End Time"
                                register={register}
                                name="end_time"
                                type="time"
                                errors={errors}
                                disabled={busy}
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
                            label="Location Type"
                            register={register}
                            name="location_type"
                            errors={errors}
                            disabled={busy}
                        >
                            <option value="Offline">Offline</option>
                            <option value="Online">Online</option>
                        </Select>
                        <Input
                            label="Location / Link"
                            placeholder="Enter venue or online meeting link"
                            register={register}
                            name="location"
                            type="text"
                            errors={errors}
                            disabled={busy}
                        />
                    </div>

                    <div className={styles.formSection}>
                        <Heading
                            icon="dollar-sign"
                            content="Pricing"
                            size="medium"
                        />
                        <Input
                            label="Price (EGP)"
                            placeholder="Enter price (0 for free)"
                            register={register}
                            name="price"
                            type="number"
                            errors={errors}
                            disabled={busy}
                        />
                    </div>

                    <div
                        className={`${styles.formSection} ${styles.attachmentsSection}`}
                    >
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
                            disabled={busy}
                            existingFiles={existingFiles}
                            setExistingFiles={setExistingFiles}
                        />
                        <LinksInputContainer
                            register={register}
                            name="links"
                            errors={errors}
                            setValue={setValue}
                            disabled={busy}
                            existingLinks={existingLinks}
                            setExistingLinks={setExistingLinks}
                        />
                    </div>

                    <div
                        className={`${styles.formSection} ${styles.accessPermissionsSection}`}
                    >
                        <Heading
                            icon="users"
                            content="Access Permissions"
                            size="medium"
                        />

                        <div className={styles.toggleRow}>
                            <label className={styles.customLabel}>
                                Restricted Event?
                            </label>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    {...register("is_restricted")}
                                    disabled={busy}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>

                        {isRestricted && (
                            <div className={styles.scopeGrid}>
                                <Select
                                    label="Faculty"
                                    register={register}
                                    name="faculty_id"
                                    errors={errors}
                                    disabled={!user?.canAccessAll || busy}
                                >
                                    <option value="">All Faculties</option>
                                    {facultyOptions}
                                </Select>

                                <Select
                                    label="Department"
                                    register={register}
                                    name="department_id"
                                    errors={errors}
                                    disabled={
                                        !user?.canAccessAll ||
                                        busy ||
                                        !selectedFaculty
                                    }
                                >
                                    <option value="">All Departments</option>
                                    {departmentOptions}
                                </Select>

                                <Select
                                    label="Academic Year"
                                    register={register}
                                    name="year_id"
                                    errors={errors}
                                    disabled={!user?.canAccessAll || busy}
                                >
                                    <option value="">All Years</option>
                                    {yearOptions}
                                </Select>
                            </div>
                        )}
                    </div>

                    <div className={styles.formActions}>
                        <Button
                            text="Cancel"
                            loadingText=""
                            type="button"
                            isSubmitting={false}
                            onClick={() => navigate("/admin/events")}
                            isSecondary
                        />
                        <Button
                            text="Update Event"
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
