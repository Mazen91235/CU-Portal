import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetCourseQuery,
    useUpdateCourseMutation,
} from "../../../services/apis/admin/CourseAPIs";
import { useLazySearchFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazySearchDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazySearchYearsQuery } from "../../../services/apis/admin/YearAPIs";
import type { Faculty } from "../../../types/entities/Faculty";
import type { Department } from "../../../types/entities/Department";
import type { Year } from "../../../types/entities/Year";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import courseIcon from "../../../assets/icons/course-icon.svg";

import styles from "./EditCourse.module.css";
import { useAuthQuery } from "../../../hooks/useAuthQuery";
import type { Subject } from "../../../types/entities/Subject";

const courseSchema = z.object({
    name: z.string().min(1, "Course name is required"),
    code: z.string().min(1, "Course code is required"),
    credits: z.string().min(1, "Credits are required"),
    faculty_id: z.string().min(1, "Faculty is required"),
    department_id: z.string().optional(),
    year_id: z.string().min(1, "Academic year is required"),
});

type CourseFormData = z.infer<typeof courseSchema>;

export const EditCourse = () => {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);

    const [getCourse] = useLazyGetCourseQuery();
    const [course, setCourse] = useState<Subject | null>(null);
    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    const [updateCourse, { isLoading }] = useUpdateCourseMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
    });

    const selectedFacultyId = watch("faculty_id");

    const fetchFaculties = useCallback(async () => {
        try {
            const result = await searchFaculties({}).unwrap();
            setFaculties(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchFaculties]);

    const fetchDepartments = useCallback(async () => {
        try {
            if (!selectedFacultyId) {
                setDepartments([]);
                return;
            }

            const result = await searchDepartments({
                faculty_id: parseInt(selectedFacultyId),
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, selectedFacultyId]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({}).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchYears]);

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
                setValue("faculty_id", course.faculty?.id?.toString() || "");
                setValue("year_id", course.year?.id?.toString() || "");
            }
        } catch (error) {
            handlePopupErrors(error);
            navigate("/admin/courses");
        }
    }, [courseId, getCourse, setValue, navigate]);

    const authQueryParams = useCallback(
        () =>
            Promise.all([
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
                fetchCourse(),
            ]),
        [fetchFaculties, fetchDepartments, fetchYears, fetchCourse],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        if (course && selectedFacultyId && departments.length > 0) {
            setValue("department_id", course.department?.id?.toString() || "");
        }
    }, [course, selectedFacultyId, departments, setValue]);

    const onSubmit = async (data: CourseFormData) => {
        if (!courseId) return;

        try {
            const courseData = {
                course_id: parseInt(courseId),
                name: data.name,
                code: data.code,
                credits: parseInt(data.credits),
                faculty_id: parseInt(data.faculty_id),
                department_id: data.department_id
                    ? parseInt(data.department_id)
                    : undefined,
                year_id: parseInt(data.year_id),
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
                icon={courseIcon}
                linkText="Back to Courses"
                linkTo="/admin/courses"
            />
            <main className={styles["container"]}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <section className={styles["formSection"]}>
                        <h2 className={styles["sectionTitle"]}>
                            Basic Information
                        </h2>

                        <div className={styles["formRow"]}>
                            <Input
                                label="Course Title"
                                register={register}
                                name="name"
                                type="text"
                                placeholder="e.g., Operating Systems"
                                errors={errors}
                            />
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
                            <Select
                                label="Faculty"
                                register={register}
                                name="faculty_id"
                                errors={errors}
                            >
                                <option value="">Select Faculty</option>
                                {faculties.map((faculty) => (
                                    <option
                                        key={faculty.id}
                                        value={faculty.id?.toString()}
                                    >
                                        {faculty.name}
                                    </option>
                                ))}
                            </Select>
                            <Select
                                label="Department"
                                register={register}
                                name="department_id"
                                errors={errors}
                            >
                                <option value="">Select Department</option>
                                {departments.map((department) => (
                                    <option
                                        key={department.id}
                                        value={department.id?.toString()}
                                    >
                                        {department.name}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className={styles["formRow"]}>
                            <Select
                                label="Academic Year"
                                register={register}
                                name="year_id"
                                errors={errors}
                            >
                                <option value="">Select Year</option>
                                {years.map((year) => (
                                    <option
                                        key={year.id}
                                        value={year.id?.toString()}
                                    >
                                        {year.year}
                                    </option>
                                ))}
                            </Select>
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
                        <button
                            type="button"
                            className={styles["btnSecondary"]}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <Button
                            text="Update Course"
                            loadingText="Updating..."
                            isSubmitting={isLoading}
                            type="submit"
                        />
                    </div>
                </form>
            </main>
        </Layout>
    );
};
