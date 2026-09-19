import { getRedirectUrl } from "../../../utils/Navigation";
import type React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCourseMutation } from "../../../services/apis/admin/CourseAPIs";
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

import styles from "./CreateCourse.module.css";
import { useCallback, useState } from "react";

const courseSchema = z.object({
    name: z.string().min(1, "Course name is required"),
    code: z.string().min(1, "Course code is required"),
    credits: z.number({ message: "Credits are required" }).nonnegative("Credits cannot be negative"),
    faculty_id: z.string().optional(),
    department_id: z.string().optional(),
    year_id: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export const CreateCourse = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = getRedirectUrl(searchParams.get("redirect_url"), "/admin/courses");
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);

    const [searchFaculties] = useLazyGetFacultiesQuery();
    const [searchDepartments] = useLazyGetDepartmentsQuery();
    const [searchYears] = useLazyGetYearsQuery();
    const user = useAppSelector((state) => state.user.user);
    const [createCourse, { isLoading }] = useCreateCourseMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<CourseFormData>({
        resolver: zodResolver(courseSchema),
    });

    const fetchFilters = useCallback(async () => {
        if (!user?.canAccessAll) {
            setValue("faculty_id", user?.faculty?.id?.toString() || "");
            setValue("department_id", user?.department?.id?.toString() || "");
            setValue("year_id", user?.year?.id?.toString() || "");
            return;
        }

        try {
            const [facultyResult, yearResult] = await Promise.all([
                searchFaculties({ data: {} }).unwrap(),
                searchYears({ data: {} }).unwrap(),
            ]);

            const availableFaculties = facultyResult.data || [];
            const availableYears = yearResult.data || [];

            setFaculties(availableFaculties);
            setYears(availableYears);
            const facultyId = user?.faculty?.id?.toString() || "";
            const departmentId = user?.department?.id?.toString() || "";
            const yearId = user?.year?.id?.toString() || "";

            if (faculties.length > 0) setValue("faculty_id", facultyId);
            if (years.length > 0) setValue("year_id", yearId);

            if (!facultyId) {
                setDepartments([]);
                return;
            }

            const departmentResult = await searchDepartments({
                data: { faculty_id: Number(facultyId) },
            }).unwrap();

            const availableDepartments = departmentResult.data || [];
            setDepartments(availableDepartments);
            if (departments.length > 0) setValue("department_id", departmentId);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        searchDepartments,
        searchFaculties,
        searchYears,
        setValue,
        user,
        faculties,
        years,
        departments,
    ]);

    const handleFacultyChange = useCallback(
        async (event: React.ChangeEvent<HTMLSelectElement>) => {
            const facultyId = event.target.value;

            setValue("faculty_id", facultyId);
            setValue("department_id", "");
            setDepartments([]);

            if (!facultyId) return;

            try {
                const result = await searchDepartments({
                    data: { faculty_id: Number(facultyId) },
                }).unwrap();
                setDepartments(result.data || []);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [searchDepartments, setValue],
    );

    useAuthQuery(fetchFilters);

    const onSubmit = async (data: CourseFormData) => {
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
                params.faculty_id = user?.faculty?.id ?? undefined;
                params.department_id = user?.department?.id ?? undefined;
                params.year_id = user?.year?.id ?? undefined;
            }

            const courseData = {
                name: data.name,
                code: data.code,
                credits: data.credits,
                faculty_id: params.faculty_id!,
                department_id: params.department_id!,
                year_id: params.year_id!,
            };

            await createCourse(courseData).unwrap();
            showToast("success", "Success", "Course created successfully");
            navigate(redirectUrl);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleCancel = () => {
        navigate(redirectUrl);
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
                icon="course"
                linkText="Back to Courses"
                linkTo={redirectUrl}
            />
            <main className={styles["container"]}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <fieldset
                        disabled={isLoading}
                        className={styles.formFieldset}
                    >
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
                                            onChange={handleFacultyChange}
                                        >
                                            <option value="">
                                                Select Faculty
                                            </option>
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
                                            <option value="">
                                                Select Year
                                            </option>
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
                                    registerOptions={{
                                        setValueAs: (value) => value === "" ? undefined : Number(value),
                                    }}
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
                    </fieldset>
                </form>
            </main>
        </Layout>
    );
};
