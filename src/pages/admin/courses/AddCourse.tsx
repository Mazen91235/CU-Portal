import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCourseMutation } from "../../../services/apis/admin/CourseAPIs";
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

import styles from "./AddCourse.module.css";
import useAuthQuery from "../../../hooks/useAuthQuery";

const courseSchema = z.object({
    name: z.string().min(1, "Course name is required"),
    code: z.string().min(1, "Course code is required"),
    credits: z.string().min(1, "Credits are required"),
    faculty_id: z.string().min(1, "Faculty is required"),
    department_id: z.string().optional(),
    year_id: z.string().min(1, "Academic year is required"),
});

type CourseFormData = z.infer<typeof courseSchema>;

export const AddCourse = () => {
    const navigate = useNavigate();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);

    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    const [createCourse, { isLoading }] = useCreateCourseMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
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

    const authQueryParams = useCallback(
        () => Promise.all([fetchFaculties(), fetchDepartments(), fetchYears()]),
        [fetchFaculties, fetchDepartments, fetchYears],
    );

    useAuthQuery(authQueryParams);

    const onSubmit = async (data: CourseFormData) => {
        try {
            const courseData = {
                name: data.name,
                code: data.code,
                credits: parseInt(data.credits),
                faculty_id: parseInt(data.faculty_id),
                department_id: data.department_id
                    ? parseInt(data.department_id)
                    : undefined,
                year_id: parseInt(data.year_id),
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
                        />
                    </div>
                </form>
            </main>
        </Layout>
    );
};
