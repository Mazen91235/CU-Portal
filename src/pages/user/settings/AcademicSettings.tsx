import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageSeo } from "../../../components/PageSeo";
import { Select } from "../../../components/forms/Select";
import { Button } from "../../../components/forms/Button";
import { Layout } from "../../../components/layout/Layout";
import { useLazyGetFacultiesQuery } from "../../../services/apis/user/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/user/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/user/YearAPIs";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { handleErrors, handlePopupErrors } from "../../../utils/ErrorHandling";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import { useUpdateUserAcademicDataMutation } from "../../../services/apis/user/UserAPIs";
import { showToast } from "../../../utils/ToastsManager";
import { useAppSelector } from "../../../services/redux/Hooks";
import useAuthQuery from "../../../hooks/useAuthQuery";
import styles from "./AcademicSettings.module.css";

const academicSchema = z.object({
    faculty: z.string().min(1, "Faculty is required"),
    studyType: z.string(),
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

    const [searchFaculties] = useLazyGetFacultiesQuery();
    const [searchDepartments] = useLazyGetDepartmentsQuery();
    const [searchYears] = useLazyGetYearsQuery();
    const [updateAcademicData] = useUpdateUserAcademicDataMutation();

    const [valuesSet, setValuesSet] = useState(false);

    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [faculty, setFaculty] = useState<FacultyResponseDto | null>(null);
    const [studyType, setStudyType] = useState<string>("");
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);

    const facultyChanged = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedFaculty =
            faculties.find((fac) => fac.id === parseInt(e.target.value, 10)) ||
            null;
        setFaculty(selectedFaculty);
        setValue("department", ""); // Reset department selection when faculty changes
        setValue("studyType", ""); // Reset study type selection when faculty changes
    };

    const studyTypeChanged = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedStudyType = e.target.value;
        setStudyType(
            selectedStudyType === "Mainstream" || selectedStudyType === "Credit"
                ? selectedStudyType
                : "",
        );
        setValue("department", ""); // Reset department selection when study type changes
    };

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
            if (!faculty || studyType === "") {
                setDepartments([]);
                return;
            }
            const result = await searchDepartments({
                data: {
                    faculty_id: faculty ? faculty.id : undefined,
                    study_type:
                        studyType === "Mainstream" || studyType === "Credit"
                            ? studyType
                            : undefined,
                },
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, faculty, studyType]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({ data: {} }).unwrap();
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
        if (valuesSet) return;
        if (faculties.length && years.length && user) {
            setValue("faculty", user.faculty?.id?.toString() || "");
            setValue(
                "studyType",
                (user.study_type as "Mainstream" | "Credit") || "",
            );
            setValue("year", user.year?.id?.toString() || "");
            setFaculty(user.faculty || null);
            setStudyType(user.study_type || "");
            if (departments.length) {
                setValue("department", user.department?.id?.toString() || "");
                setValuesSet(true);
            }
        }
    }, [
        setValue,
        setValuesSet,
        user,
        faculties,
        years,
        departments,
        valuesSet,
    ]);

    const onSubmit = async (data: AcademicFormData) => {
        try {
            await updateAcademicData({
                faculty_id: parseInt(data.faculty, 10),
                study_type:
                    data.studyType === "Mainstream" ||
                    data.studyType === "Credit"
                        ? data.studyType
                        : undefined,
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
                            <fieldset disabled={isSubmitting} className={styles.form}>
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
                                                value={faculty.id ?? ""}
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
                                                value={year.id ?? ""}
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
                                                value={department.id ?? ""}
                                            >
                                                {department.name}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </fieldset>

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
