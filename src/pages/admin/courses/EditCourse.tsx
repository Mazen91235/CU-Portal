import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetCourseQuery,
    useUpdateCourseMutation,
} from "../../../services/apis/admin/CourseAPIs";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Input } from "../../../components/forms/Input";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { Heading } from "../../../components/heading/Heading";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useAppSelector } from "../../../services/redux/Hooks";

import styles from "./EditCourse.module.css";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";

const courseSchema = z.object({
    name: z.string().min(1, "Course name is required"),
    code: z.string().min(1, "Course code is required"),
    credits: z.string().min(1, "Credits are required"),
    faculty_id: z.string().optional(),
    department_id: z.string().optional(),
    year_id: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export const EditCourse = () => {
    const navigate = useNavigate();
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);

    const [searchFaculties] = useLazyGetFacultiesQuery();
    const [searchDepartments] = useLazyGetDepartmentsQuery();
    const [searchYears] = useLazyGetYearsQuery();
    const user = useAppSelector((state) => state.user.user);
    const { courseId } = useParams<{ courseId: string }>();

    const [getCourse] = useLazyGetCourseQuery();
    const [course, setCourse] = useState<SubjectResponseDto | null>(null);
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
            const result = await searchFaculties({ data: {} }).unwrap();
            setFaculties(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchFaculties]);

    const fetchDepartments = useCallback(async () => {
        try {
            if (!selectedFacultyId) return;
            const result = await searchDepartments({ data: {
                faculty_id: parseInt(selectedFacultyId),
            } }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, selectedFacultyId]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({ data: {} }).unwrap();
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
                if (faculties.length > 0)
                    setValue(
                        "faculty_id",
                        course.faculty?.id?.toString() || "",
                    );
                if (years.length > 0)
                    setValue("year_id", course.year?.id?.toString() || "");
            }
        } catch (error) {
            handlePopupErrors(error);
            navigate("/admin/courses");
        }
    }, [courseId, faculties, years, getCourse, setValue, navigate]);

    useEffect(() => {
        if (course && selectedFacultyId && departments.length > 0)
            setValue("department_id", course.department?.id?.toString() || "");
    }, [course, selectedFacultyId, departments, setValue]);

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

    const onSubmit = async (data: CourseFormData) => {
        if (!courseId) return;

        try {
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};
            if (data.faculty_id) params.faculty_id = parseInt(data.faculty_id);
            if (data.department_id)
                params.department_id = parseInt(data.department_id);
            if (data.year_id) params.year_id = parseInt(data.year_id);

            if (!user?.canAccessAll) {
                params.faculty_id = user?.faculty?.id ?? undefined ?? undefined;
                params.department_id = user?.department?.id ?? undefined ?? undefined;
                params.year_id = user?.year?.id ?? undefined ?? undefined;
            }

            const courseData = {
                course_id: parseInt(courseId),
                name: data.name,
                code: data.code,
                credits: parseInt(data.credits),
                faculty_id: params.faculty_id!,
                department_id: params.department_id!,
                year_id: params.year_id!,
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
                icon="course"
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
                        {user?.canAccessAll && (
                            <>
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
                                </div>
                                <div className={styles["formRow"]}>
                                    <Select
                                        label="Department"
                                        register={register}
                                        name="department_id"
                                        errors={errors}
                                    >
                                        <option value="">
                                            Select Department
                                        </option>
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
                                </div>
                            </>
                        )}
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
