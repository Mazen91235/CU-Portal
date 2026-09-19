import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { buildRedirectUrl } from "../../../utils/Navigation";
import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import { DateFilter } from "../../../components/forms/DateFilter";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Layout } from "../../../components/layout/Layout";
import { NoContentSection } from "../../../components/section/NoContentSection";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { PageSeo } from "../../../components/PageSeo";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
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
import { formatDate, formatDateTime, toIsoFormat } from "../../../utils/Formatter";
import { showToast } from "../../../utils/ToastsManager";
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
    const { getFilter, getFilterSetter, setFilters } = useFilterSearchParams();
    const facultyFilter = getFilter("faculty_id", "");
    const setFacultyFilter = getFilterSetter("faculty_id");
    const departmentFilter = getFilter("department_id", "");
    const setDepartmentFilter = getFilterSetter("department_id");
    const yearFilter = getFilter("year_id", "");
    const setYearFilter = getFilterSetter("year_id");
    const dateFrom = getFilter("date_from", "");
    const setDateFrom = getFilterSetter("date_from", true);
    const dateTo = getFilter("date_to", "");
    const setDateTo = getFilterSetter("date_to", true);
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
                    start_date_from: toIsoFormat(dateFrom),
                    start_date_to: toIsoFormat(dateTo),
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

    const fetchFaculties = useCallback(async () => {
        if (!user?.canAccessAll) return;
        try {
            const result = await getFaculties({ data: {} }).unwrap();
            setFaculties(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getFaculties, user?.canAccessAll]);

    const fetchDepartments = useCallback(async () => {
        if (!user?.canAccessAll || !facultyFilter) {
            setDepartments([]);
            return;
        }
        try {
            const result = await getDepartments({
                data: { faculty_id: Number(facultyFilter) },
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartments, user?.canAccessAll, facultyFilter]);

    const fetchYears = useCallback(async () => {
        if (!user?.canAccessAll) return;
        try {
            const result = await getYears({ data: {} }).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getYears, user?.canAccessAll]);

    useEffect(() => {
        if (!user?.canAccessAll) {
            setFacultyFilter(user?.faculty?.id?.toString() || "");
            setDepartmentFilter(user?.department?.id?.toString() || "");
            setYearFilter(user?.year?.id?.toString() || "");
        }
    }, [setFacultyFilter, setDepartmentFilter, setYearFilter, user]);

    const authFacultiesQuery = useCallback(
        () => fetchFaculties(),
        [fetchFaculties],
    );
    const authDepartmentsQuery = useCallback(
        () => fetchDepartments(),
        [fetchDepartments],
    );
    const authYearsQuery = useCallback(() => fetchYears(), [fetchYears]);

    const authWeeksQuery = useCallback(() => fetch(), [fetch]);

    useAuthQuery(authFacultiesQuery);
    useAuthQuery(authDepartmentsQuery);
    useAuthQuery(authYearsQuery);
    useAuthQuery(authWeeksQuery);

    const removeWeek = async () => {
        if (!weekToDelete?.id) return;
        try {
            await deleteWeek({ week_id: weekToDelete.id }).unwrap();
            showToast("success", "Success", "Week deleted successfully");
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
                description="Manage weeks"
            />
            <Banner
                title="Weeks Management"
                description="Manage weeks"
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
                                    setValue={(value) =>
                                        setFilters({
                                            faculty_id: value as string,
                                            department_id: null,
                                        })
                                    }
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
                                    disabled={!facultyFilter}
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
                            value={dateFrom}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateTo}
                            value={dateTo}
                            startDay={false}
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
                                    value: formatDate(week.start_date),
                                },
                                {
                                    icon: "calendar",
                                    label: "End date",
                                    value: formatDate(
                                        getWeekEndDate(week.start_date),
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
                                navigate(buildRedirectUrl(`/admin/weeks/${week.id}`))
                            }
                            hasOptions
                            editable
                            onEdit={() =>
                                navigate(
                                    buildRedirectUrl(
                                        `/admin/weeks/edit/${week.id}`,
                                    ),
                                )
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
