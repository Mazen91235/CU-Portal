import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateExamMutation } from "../../../services/apis/admin/ExamAPIs";
import { useLazySearchCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import type { Subject } from "../../../types/entities/Subject";
import { handleErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { SearchableInput } from "../../../components/forms/SearchableInput";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { useAppSelector } from "../../../services/redux/Hooks";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { Form } from "../../../components/forms/Form";
import { Heading } from "../../../components/heading/Heading";

import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./CreateExam.module.css";

const examSchema = z.object({
    title: z.string().min(1, "Exam name is required"),
    subject_id: z.string().min(1, "Subject is required"),
    exam_type: z.string().optional(),
    due_date: z.string().min(1, "Exam date is required"),
    start_time: z.string().optional(),
    duration: z.string().optional(),
    location: z.string().optional(),
    exam_format: z.string().optional(),
    exam_weight: z.string().optional(),
    description: z.string().optional(),
    instructions: z.string().optional(),
});

type ExamFormData = z.infer<typeof examSchema>;

export const CreateExam = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const user = useAppSelector((state) => state.user.user);

    const [searchCourses] = useLazySearchCoursesQuery();
    const [createExam, { isLoading }] = useCreateExamMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        setValue,
        control,
    } = useForm<ExamFormData>({
        resolver: zodResolver(examSchema),
    });

    const fetchSubjects = useCallback(async () => {
        try {
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};
            if (!user) return;
            params.faculty_id = user.faculty?.id;
            params.department_id = user.department?.id;
            params.year_id = user.year?.id;
            const result = await searchCourses(params).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            const err = (error as DefaultAPIResponse).data;
            navigate("/admin/exams", {
                state: { error: err.message || "Failed to fetch subjects." },
            });
        }
    }, [searchCourses, navigate, user]);

    const authQueryParams = useCallback(() => fetchSubjects(), [fetchSubjects]);

    useAuthQuery(authQueryParams);

    const onSubmit = async (data: ExamFormData) => {
        try {
            const examData = {
                title: data.title,
                subject_id: parseInt(data.subject_id),
                exam_type: data.exam_type,
                due_date: data.due_date,
                start_time: data.start_time,
                duration: data.duration ? parseFloat(data.duration) : undefined,
                location: data.location,
                exam_format: data.exam_format as
                    | "MCQ"
                    | "Written"
                    | "Mixed"
                    | "Practical"
                    | "Oral"
                    | "Other",
                exam_weight: data.exam_weight,
                description: data.description,
                instructions: data.instructions,
            };

            await createExam(examData).unwrap();
            navigate("/admin/exams", {
                state: { success: "Exam created successfully!" },
            });
        } catch (error) {
            handleErrors(error, setError);
        }
    };

    const handleCancel = () => {
        navigate("/admin/exams");
    };

    return (
        <Layout>
            <PageSeo
                title="Create New Exam | CU Portal"
                description="Add a new exam for your students"
            />
            <SubBanner
                title="Create New Exam"
                description="Add a new exam for your students"
                icon={GetIcon("task")}
                linkText="Back to Exams"
                linkTo="/admin/exams"
            />
            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    className={styles.formCard}
                >
                    <div className={styles.formSection}>
                        <Heading
                            icon="info-circle"
                            content="Basic Information"
                            size="medium"
                        />
                        <Input
                            label="Exam Name"
                            placeholder="Enter exam name"
                            register={register}
                            name="title"
                            type="text"
                            errors={errors}
                            disabled={isLoading}
                        />
                        <SearchableInput
                            label="Subject"
                            placeholder="Select a subject"
                            register={register}
                            name="subject_id"
                            errors={errors}
                            disabled={isLoading}
                            setValue={setValue}
                            control={control}
                            options={subjects.map((subject) => ({
                                value: subject.id?.toString() || "",
                                label: subject.name || "",
                            }))}
                        />
                        <Select
                            label="Exam Type"
                            register={register}
                            name="exam_type"
                            errors={errors}
                            disabled={isLoading}
                        >
                            <option value="">Select Exam Type</option>
                            <option value="Midterm">Midterm</option>
                            <option value="Final">Final</option>
                            <option value="Quiz">Quiz</option>
                            <option value="Practical">Practical</option>
                            <option value="Oral">Oral</option>
                            <option value="Other">Other</option>
                        </Select>
                    </div>

                    <div className={styles.formSection}>
                        <Heading
                            icon="calendar-alt"
                            content="Schedule & Location"
                            size="medium"
                        />
                        <div className={styles.dateTimeGroup}>
                            <Input
                                label="Exam Date"
                                type="date"
                                register={register}
                                name="due_date"
                                errors={errors}
                                disabled={isLoading}
                            />
                            <Input
                                label="Start Time"
                                type="time"
                                register={register}
                                name="start_time"
                                errors={errors}
                                disabled={isLoading}
                            />
                        </div>
                        <Input
                            label="Duration (hours)"
                            type="number"
                            placeholder="Enter exam duration"
                            register={register}
                            name="duration"
                            errors={errors}
                            disabled={isLoading}
                        />
                        <Input
                            label="Location"
                            placeholder="Enter exam location"
                            register={register}
                            name="location"
                            type="text"
                            errors={errors}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.formSection}>
                        <Heading
                            icon="file-alt"
                            content="Exam Details"
                            size="medium"
                        />
                        <Select
                            label="Exam Format"
                            register={register}
                            name="exam_format"
                            errors={errors}
                            disabled={isLoading}
                        >
                            <option value="">Select Exam Format</option>
                            <option value="MCQ">MCQ</option>
                            <option value="Written">Written</option>
                            <option value="Mixed">Mixed</option>
                            <option value="Practical">Practical</option>
                            <option value="Oral">Oral</option>
                            <option value="Other">Other</option>
                        </Select>
                        <Input
                            label="Exam Weight"
                            placeholder="e.g., 10% or 30 marks"
                            register={register}
                            name="exam_weight"
                            type="text"
                            errors={errors}
                            disabled={isLoading}
                        />
                        <Input
                            label="Description"
                            type="textarea"
                            placeholder="Brief description of the exam content..."
                            register={register}
                            name="description"
                            errors={errors}
                            disabled={isLoading}
                            isTextArea
                        />
                        <Input
                            label="Instructions"
                            type="textarea"
                            placeholder="Write clear guidelines students must follow during the exam"
                            register={register}
                            name="instructions"
                            errors={errors}
                            disabled={isLoading}
                            isTextArea
                        />
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
                            text="Create Exam"
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
