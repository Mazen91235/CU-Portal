import { useCallback, useState } from "react";
import type React from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { PageSeo } from "../../../components/PageSeo";
import { Form } from "../../../components/forms/Form";
import { Input } from "../../../components/forms/Input";
import { Select } from "../../../components/forms/Select";
import { DateInput } from "../../../components/forms/DateInput";
import { Button } from "../../../components/forms/Button";
import { useAppSelector } from "../../../services/redux/Hooks";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useCreateWeekMutation } from "../../../services/apis/admin/WeekAPIs";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import styles from "./WeekForm.module.css";

const weekSchema = z.object({
    week_number: z.string().min(1, "Starting week number is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    faculty_id: z.string().min(1, "Faculty is required"),
    department_id: z.string().min(1, "Department is required"),
    year_id: z.string().min(1, "Academic year is required"),
});

type WeekFormData = z.infer<typeof weekSchema>;

const getWeeksCount = (start: string, end: string) => {
    if (!start || !end || end < start) return 0;
    const days =
        (new Date(`${end}T00:00:00Z`).getTime() -
            new Date(`${start}T00:00:00Z`).getTime()) /
            86400000 +
        1;
    return Math.ceil(days / 7);
};

export function CreateWeek() {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const [faculties, setFaculties] = useState<
        { id?: number | null; name?: string | null }[]
    >([]);
    const [departments, setDepartments] = useState<
        { id?: number | null; name?: string | null }[]
    >([]);
    const [years, setYears] = useState<
        { id?: number | null; year?: number | null }[]
    >([]);
    const [createWeek, { isLoading }] = useCreateWeekMutation();
    const [getFaculties] = useLazyGetFacultiesQuery();
    const [getDepartments] = useLazyGetDepartmentsQuery();
    const [getYears] = useLazyGetYearsQuery();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors, isSubmitting },
    } = useForm<WeekFormData>({
        resolver: zodResolver(weekSchema),
        defaultValues: {
            week_number: "1",
            faculty_id: "",
            department_id: "",
            year_id: "",
        },
    });
    const startDate = watch("start_date");
    const endDate = watch("end_date");
    const weeksCount = getWeeksCount(startDate, endDate);

    const fetchFilters = useCallback(async () => {
        if (!user?.canAccessAll) {
            setValue("faculty_id", user?.faculty?.id?.toString() || "");
            setValue("department_id", user?.department?.id?.toString() || "");
            setValue("year_id", user?.year?.id?.toString() || "");
            return;
        }

        try {
            const [facultyResult, yearResult] = await Promise.all([
                getFaculties({ data: {} }).unwrap(),
                getYears({ data: {} }).unwrap(),
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

            const departmentResult = await getDepartments({
                data: { faculty_id: Number(facultyId) },
            }).unwrap();

            const availableDepartments = departmentResult.data || [];
            setDepartments(availableDepartments);

            if (departments.length > 0) setValue("department_id", departmentId);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getDepartments,
        getFaculties,
        getYears,
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
                const result = await getDepartments({
                    data: { faculty_id: Number(facultyId) },
                }).unwrap();
                setDepartments(result.data || []);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [getDepartments, setValue],
    );

    useAuthQuery(fetchFilters);

    const onSubmit = async (data: WeekFormData) => {
        try {
            for (let index = 0; index < weeksCount; index += 1) {
                const date = new Date(`${data.start_date}T00:00:00Z`);
                date.setUTCDate(date.getUTCDate() + index * 7);
                await createWeek({
                    week_number: Number(data.week_number) + index,
                    start_date: date.toISOString(),
                    faculty_id: Number(data.faculty_id),
                    department_id: Number(data.department_id),
                    year_id: Number(data.year_id),
                }).unwrap();
            }
            showToast(
                "success",
                "Created",
                `${weeksCount} week${weeksCount === 1 ? "" : "s"} created successfully`,
            );
            navigate("/admin/weeks");
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const busy = isLoading || isSubmitting;
    return (
        <Layout>
            <PageSeo
                title="Create Weeks - CU Portal"
                description="Create weeks"
            />
            <SubBanner
                title="Create Weeks"
                description="Create one or more weeks"
                linkText="Back to Weeks"
                linkTo="/admin/weeks"
            />
            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    disabled={busy}
                    className={styles.formCard}
                >
                    <Input
                        label="Starting Week Number"
                        register={register}
                        name="week_number"
                        type="number"
                        errors={errors}
                        disabled={busy}
                    />
                    <DateInput
                        label="Start Date"
                        register={register}
                        name="start_date"
                        errors={errors}
                        setValue={setValue}
                        control={control}
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
                        label="Estimated Weeks"
                        type="number"
                        errors={{}}
                        value={weeksCount}
                        disabled
                    />
                    {user?.canAccessAll && (
                        <>
                            <Select
                                label="Faculty"
                                register={register}
                                name="faculty_id"
                                errors={errors}
                                disabled={busy}
                                onChange={handleFacultyChange}
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
                                disabled={busy}
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
                            <Select
                                label="Academic Year"
                                register={register}
                                name="year_id"
                                errors={errors}
                                disabled={busy}
                            >
                                <option value="">Select Academic Year</option>
                                {years.map((year) => (
                                    <option
                                        key={year.id}
                                        value={year.id?.toString()}
                                    >
                                        {year.year}
                                    </option>
                                ))}
                            </Select>
                        </>
                    )}
                    <div className={styles.formActions}>
                        <Button
                            text="Cancel"
                            loadingText="Cancelling..."
                            type="button"
                            isSubmitting={false}
                            isSecondary
                            onClick={() => navigate("/admin/weeks")}
                        />
                        <Button
                            text="Create Weeks"
                            loadingText="Creating..."
                            type="submit"
                            isSubmitting={busy}
                            isOrange={false}
                        />
                    </div>
                </Form>
            </main>
        </Layout>
    );
}
