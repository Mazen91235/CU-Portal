import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCourseMutation } from "../../../services/apis/admin/CourseAPIs";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { Heading } from "../../../components/heading/Heading";

import { GetIcon } from "../../../utils/LinkHandler";

import styles from "./CreateCourse.module.css";
import { useAppSelector } from "../../../services/redux/Hooks";

const courseSchema = z.object({
    name: z.string().min(1, "Course name is required"),
    code: z.string().min(1, "Course code is required"),
    credits: z.string().min(1, "Credits are required"),
});

type CourseFormData = z.infer<typeof courseSchema>;

export const CreateCourse = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const [createCourse, { isLoading }] = useCreateCourseMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
    });

    const onSubmit = async (data: CourseFormData) => {
        try {
            const courseData = {
                name: data.name,
                code: data.code,
                credits: parseInt(data.credits),
                faculty_id: user?.faculty?.id,
                department_id: user?.department?.id,
                year_id: user?.year?.id,
            };

            await createCourse(courseData).unwrap();
            showToast("success", "Success", "Course created successfully");
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
                title="Create New Course | CU Portal"
                description="Add a new course to the university catalog"
            />
            <SubBanner
                title="Create New Course"
                description="Add a new course to the university catalog"
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
                            text="Create Course"
                            loadingText="Creating..."
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
