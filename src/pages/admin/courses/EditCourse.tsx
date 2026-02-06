import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetCourseQuery,
    useUpdateCourseMutation,
} from "../../../services/apis/admin/CourseAPIs";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { Heading } from "../../../components/heading/Heading";
import { useAuthQuery } from "../../../hooks/useAuthQuery";
import type { Subject } from "../../../types/entities/Subject";

import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./EditCourse.module.css";
import { useAppSelector } from "../../../services/redux/Hooks";

const courseSchema = z.object({
    name: z.string().min(1, "Course name is required"),
    code: z.string().min(1, "Course code is required"),
    credits: z.string().min(1, "Credits are required"),
});

type CourseFormData = z.infer<typeof courseSchema>;

export const EditCourse = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const { courseId } = useParams<{ courseId: string }>();

    const [getCourse] = useLazyGetCourseQuery();
    const [, setCourse] = useState<Subject | null>(null);
    const [updateCourse, { isLoading }] = useUpdateCourseMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
    });

    const fetchCourse = useCallback(async () => {
        if (!courseId) return;

        try {
            const result = await getCourse({
                course_id: parseInt(courseId),
            }).unwrap();
            const course = result.data;
            setCourse(course || null);
            if (course) {
                setValue("name", course.name || "");
                setValue("code", course.code || "");
                setValue("credits", course.credits?.toString() || "");
            }
        } catch (error) {
            handlePopupErrors(error);
            navigate("/admin/courses");
        }
    }, [courseId, getCourse, setValue, navigate]);

    const authQueryParams = useCallback(() => fetchCourse(), [fetchCourse]);

    useAuthQuery(authQueryParams);

    const onSubmit = async (data: CourseFormData) => {
        if (!courseId) return;

        try {
            const courseData = {
                course_id: parseInt(courseId),
                name: data.name,
                code: data.code,
                credits: parseInt(data.credits),
                faculty_id: user?.faculty?.id,
                department_id: user?.department?.id,
                year_id: user?.year?.id,
            };

            await updateCourse(courseData).unwrap();
            showToast("success", "Success", "Course updated successfully");
            navigate("/admin/courses");
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleCancel = () => {
        navigate("/admin/courses");
    };

    return (
        <Layout>
            <PageSeo
                title="Edit Course | CU Portal"
                description="Update course information"
            />
            <SubBanner
                title="Edit Course"
                description="Update course information"
                icon={GetIcon("course")}
                linkText="Back to Courses"
                linkTo="/admin/courses"
            />
            <main className={styles["container"]}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <section className={styles["formSection"]}>
                        <Heading
                            icon="info-circle"
                            content="Basic Information"
                            size="medium"
                        />

                        <div className={styles["formRow"]}>
                            <Input
                                label="Course Title"
                                register={register}
                                name="name"
                                type="text"
                                placeholder="e.g., Operating Systems"
                                errors={errors}
                            />
                        </div>

                        <div className={styles["formRow"]}>
                            <Input
                                label="Course Code"
                                register={register}
                                name="code"
                                type="text"
                                placeholder="e.g., CS301"
                                errors={errors}
                            />
                        </div>

                        <div className={styles["formRow"]}>
                            <Input
                                label="Credits"
                                register={register}
                                name="credits"
                                type="number"
                                placeholder="3"
                                errors={errors}
                            />
                        </div>
                    </section>

                    <div className={styles["formActions"]}>
                        <Button
                            text="Cancel"
                            loadingText="Cancelling..."
                            type="button"
                            isSubmitting={false}
                            onClick={handleCancel}
                            isSecondary={true}
                        />
                        <Button
                            text="Update Course"
                            loadingText="Updating..."
                            isSubmitting={isLoading}
                            type="submit"
                            isOrange={false}
                        />
                    </div>
                </form>
            </main>
        </Layout>
    );
};
