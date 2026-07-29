import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageSeo } from "../../../components/PageSeo";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { useLazySearchFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazySearchDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazySearchYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { handleErrors, handlePopupErrors } from "../../../utils/ErrorHandling";
import type { Faculty } from "../../../types/entities/Faculty";
import type { Department } from "../../../types/entities/Department";
import type { Year } from "../../../types/entities/Year";
import { useUpdateUserAcademicDataMutation } from "../../../services/apis/user/UserAPIs";
import { showToast } from "../../../utils/ToastsManager";
import { useAppSelector } from "../../../services/redux/Hooks";
import useAuthQuery from "../../../hooks/useAuthQuery";
import styles from "./AcademicSettings.module.css";

const academicSchema = z.object({
    faculty: z.string().min(1, "Faculty is required"),
    studyType: z.enum(["Mainstream", "Credit"]),
    year: z.string().min(1, "Year is required"),
    department: z.string().min(1, "Department is required"),
});

type AcademicFormData = z.infer<typeof academicSchema>;

export const AcademicSettings = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
        setValue,
    } = useForm<AcademicFormData>({
        resolver: zodResolver(academicSchema),
    });

    const user = useAppSelector((state) => state.user.user);

    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    const [updateAcademicData] = useUpdateUserAcademicDataMutation();

    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [faculty, setFaculty] = useState<Faculty | null>(null);
    const [studyType, setStudyType] = useState<string>("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);

    const facultyChanged = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedFaculty =
            faculties.find((fac) => fac.id === parseInt(e.target.value, 10)) ||
            null;
        setFaculty(selectedFaculty);
    };

    const studyTypeChanged = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedStudyType = e.target.value;
        setStudyType(selectedStudyType);
    };

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
            if (!faculty || studyType === "") {
                setDepartments([]);
                return;
            }
            const result = await searchDepartments({
                faculty_id: faculty ? faculty.id : undefined,
                study_type: studyType !== "" ? studyType : undefined,
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, faculty, studyType]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({}).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchYears]);

    const authQueryParam = useCallback(
        () => Promise.all([fetchFaculties(), fetchDepartments(), fetchYears()]),
        [fetchFaculties, fetchDepartments, fetchYears],
    );

    useAuthQuery(authQueryParam);

    useEffect(() => {
        if (faculties.length && years.length && user) {
            setValue("faculty", user.faculty?.id?.toString() || "");
            setValue("studyType", (user.type as "Mainstream" | "Credit") || "");
            setValue("year", user.year?.id?.toString() || "");
            setFaculty(user.faculty || null);
            setStudyType((user.type as string) || "");
            if (departments.length)
                setValue("department", user.department?.id?.toString() || "");
        }
    }, [setValue, user, faculties, years, departments]);

    const onSubmit = async (data: AcademicFormData) => {
        try {
            await updateAcademicData({
                faculty_id: parseInt(data.faculty, 10),
                study_type: data.studyType,
                year_id: parseInt(data.year, 10),
                department_id: parseInt(data.department, 10),
            }).unwrap();
            showToast(
                "success",
                "Success",
                "Academic settings updated successfully.",
            );
        } catch (error) {
            handleErrors(error, setError);
        }
    };

    return (
        <>
            <PageSeo
                title="Academic Settings - CU Portal"
                description="Manage your academic settings"
            />
            <Layout>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <h4 className={styles.title}>Academic Settings</h4>
                            <div className={styles.underline} />
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className={styles.form}>
                                <div className={styles.selectGroup}>
                                    <Select
                                        register={register}
                                        name="faculty"
                                        errors={errors}
                                        label="Faculty"
                                        onChange={facultyChanged}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">
                                            Select your faculty
                                        </option>
                                        {faculties.map((faculty) => (
                                            <option
                                                key={faculty.id}
                                                value={faculty.id}
                                            >
                                                {faculty.name}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        register={register}
                                        name="studyType"
                                        errors={errors}
                                        label="Study Type"
                                        onChange={studyTypeChanged}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">
                                            Select a study type
                                        </option>
                                        <option value="Mainstream">
                                            Mainstream
                                        </option>
                                        <option value="Credit">Credit</option>
                                    </Select>
                                </div>
                                <div className={styles.selectGroup}>
                                    <Select
                                        register={register}
                                        name="year"
                                        errors={errors}
                                        label="Year"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">
                                            Select your year
                                        </option>
                                        {years.map((year) => (
                                            <option
                                                key={year.id}
                                                value={year.id}
                                            >
                                                {year.year}
                                            </option>
                                        ))}
                                    </Select>

                                    <Select
                                        register={register}
                                        name="department"
                                        errors={errors}
                                        label="Department"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">
                                            Select your department
                                        </option>
                                        {departments.map((department) => (
                                            <option
                                                key={department.id}
                                                value={department.id}
                                            >
                                                {department.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div className={styles.buttonContainer}>
                                <Button
                                    text="Save changes"
                                    loadingText={
                                        isSubmitting
                                            ? "Saving..."
                                            : "Save changes"
                                    }
                                    isSubmitting={isSubmitting}
                                    isOrange={false}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </>
    );
};
