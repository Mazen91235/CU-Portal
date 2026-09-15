import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import { DateFilter } from "../../../components/forms/DateFilter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Layout } from "../../../components/layout/Layout";
import { NoContentSection } from "../../../components/section/NoContentSection";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { PageSeo } from "../../../components/PageSeo";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useAppSelector } from "../../../services/redux/Hooks";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import {
    useDeleteWeekMutation,
    useLazyGetWeeksQuery,
} from "../../../services/apis/admin/WeekAPIs";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import { formatDate, formatDateTime } from "../../../utils/Formatter";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import styles from "./WeeksPage.module.css";

const getWeekEndDate = (startDate?: string | null) => {
    if (!startDate) return null;
    const date = new Date(formatDateTime(startDate, true));
    date.setUTCDate(date.getUTCDate() + 6);
    return date.toISOString().slice(0, 10);
};

export function WeeksPage() {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const [weeks, setWeeks] = useState<WeekResponseDto[]>([]);
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);
    const [facultyFilter, setFacultyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [weekToDelete, setWeekToDelete] = useState<WeekResponseDto | null>(
        null,
    );
    const [getWeeks, { isFetching }] = useLazyGetWeeksQuery();
    const [deleteWeek] = useDeleteWeekMutation();
    const [getFaculties] = useLazyGetFacultiesQuery();
    const [getDepartments] = useLazyGetDepartmentsQuery();
    const [getYears] = useLazyGetYearsQuery();

    const fetch = useCallback(async () => {
        try {
            const result = await getWeeks({
                data: {
                    faculty_id: user?.canAccessAll
                        ? Number(facultyFilter) || undefined
                        : user?.faculty?.id,
                    department_id: user?.canAccessAll
                        ? Number(departmentFilter) || undefined
                        : user?.department?.id,
                    year_id: user?.canAccessAll
                        ? Number(yearFilter) || undefined
                        : user?.year?.id,
                    start_date_from: dateFrom || undefined,
                    start_date_to: dateTo || undefined,
                },
                order_by: ["start_date"],
                descending: true,
                includes: ["faculty", "department", "year"],
                limit: 1e6,
            }).unwrap();
            setWeeks(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getWeeks,
        user,
        facultyFilter,
        departmentFilter,
        yearFilter,
        dateFrom,
        dateTo,
    ]);

    const loadFilters = useCallback(async () => {
        if (!user?.canAccessAll) return;
        try {
            const [facultyResult, yearResult] = await Promise.all([
                getFaculties({ data: {} }).unwrap(),
                getYears({ data: {} }).unwrap(),
            ]);
            setFaculties(facultyResult.data || []);
            setYears(yearResult.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getFaculties, getYears, user?.canAccessAll]);

    useEffect(() => {
        if (!user?.canAccessAll) {
            setFacultyFilter(user?.faculty?.id?.toString() || "");
            setDepartmentFilter(user?.department?.id?.toString() || "");
            setYearFilter(user?.year?.id?.toString() || "");
        }
    }, [user]);

    useEffect(() => {
        if (!user?.canAccessAll || !facultyFilter) {
            setDepartments([]);
            setDepartmentFilter("");
            return;
        }
        setDepartmentFilter("");
        void getDepartments({ data: { faculty_id: Number(facultyFilter) } })
            .unwrap()
            .then((result) => setDepartments(result.data || []))
            .catch(handlePopupErrors);
    }, [getDepartments, facultyFilter, user?.canAccessAll]);

    const authQuery = useCallback(
        () => Promise.all([fetch(), loadFilters()]),
        [fetch, loadFilters],
    );

    useAuthQuery(authQuery);

    const removeWeek = async () => {
        if (!weekToDelete?.id) return;
        try {
            await deleteWeek({ week_id: weekToDelete.id }).unwrap();
            setWeekToDelete(null);
            await fetch();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Weeks Management - CU Portal"
                description="Manage weekly guides"
            />
            <Banner
                title="Weeks Management"
                description="Manage weekly guides"
                button="Create Weeks"
                buttonAction={() => navigate("/admin/weeks/create")}
            />
            <main className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.filtersRow}>
                        {user?.canAccessAll && (
                            <>
                                <SelectFilter
                                    options={[
                                        { value: "", label: "Faculty" },
                                        ...faculties.map((item) => ({
                                            value: String(item.id),
                                            label: item.name || "",
                                        })),
                                    ]}
                                    value={facultyFilter}
                                    setValue={setFacultyFilter}
                                />
                                <SelectFilter
                                    options={[
                                        { value: "", label: "Department" },
                                        ...departments.map((item) => ({
                                            value: String(item.id),
                                            label: item.name || "",
                                        })),
                                    ]}
                                    value={departmentFilter}
                                    setValue={setDepartmentFilter}
                                />
                                <SelectFilter
                                    options={[
                                        { value: "", label: "Academic Year" },
                                        ...years.map((item) => ({
                                            value: String(item.id),
                                            label: String(item.year || ""),
                                        })),
                                    ]}
                                    value={yearFilter}
                                    setValue={setYearFilter}
                                />
                            </>
                        )}
                        <DateFilter
                            placeholder="Date From"
                            setValue={setDateFrom}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateTo}
                        />
                    </div>
                </div>
                <div className={styles.weeksGrid}>
                    {weeks.map((week) => (
                        <Card
                            key={week.id}
                            title={`Week ${week.week_number ?? ""}`}
                            badge={
                                `${week.department?.code || week.department?.name || ""} ${week.year?.year || ""}`.trim() ||
                                "Week"
                            }
                            items={[
                                {
                                    icon: "calendar",
                                    label: "Start date",
                                    value: formatDate(week.start_date, false),
                                },
                                {
                                    icon: "calendar",
                                    label: "End date",
                                    value: formatDate(
                                        getWeekEndDate(week.start_date),
                                        false,
                                    ),
                                },
                                {
                                    icon: "building",
                                    label: "Faculty",
                                    value: week.faculty?.name || "N/A",
                                },
                            ]}
                            button="View Week"
                            buttonAction={() =>
                                navigate(`/admin/weeks/${week.id}`)
                            }
                            hasOptions
                            editable
                            onEdit={() =>
                                navigate(`/admin/weeks/edit/${week.id}`)
                            }
                            deletable
                            onDelete={() => setWeekToDelete(week)}
                        />
                    ))}
                </div>
                {weeks.length === 0 && !isFetching && (
                    <NoContentSection icon="calendar" label="No weeks found" />
                )}
            </main>
            <ConfirmModal
                isOpen={weekToDelete !== null}
                onClose={() => setWeekToDelete(null)}
                onConfirm={removeWeek}
                confirmText="Delete"
                title="Delete this week?"
                message="This will remove the selected week from the weekly guide."
                colorType="red"
            />
        </Layout>
    );
}
