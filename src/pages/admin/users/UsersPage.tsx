import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Pagination } from "../../../components/pagination/Pagination";
import {
    useLazyGetUsersQuery,
    useLazyGetUserStatisticsQuery,
} from "../../../services/apis/admin/UserAPIs";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import type { UserResponseDto } from "../../../types/dtos/UserDtos";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import IconComponent from "../../../components/IconComponent";
import { Table } from "../../../components/table/Table";
import { useAppSelector } from "../../../services/redux/Hooks";
import styles from "./UsersPage.module.css";

export const UsersPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const { getFilter, getFilterSetter, setFilters } = useFilterSearchParams();
    const searchQuery = getFilter("query");
    const setSearchQuery = getFilterSetter("query");
    const selectedFaculty = getFilter("faculty_id");
    const selectedDepartment = getFilter("department_id");
    const setSelectedDepartment = getFilterSetter("department_id");
    const selectedYear = getFilter("year_id");
    const setSelectedYear = getFilterSetter("year_id");
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);

    const [getUsers, { isFetching }] = useLazyGetUsersQuery();
    const [getUsersData, { data: usersStatsData }] =
        useLazyGetUserStatisticsQuery();
    const [searchFaculties] = useLazyGetFacultiesQuery();
    const [searchDepartments] = useLazyGetDepartmentsQuery();
    const [searchYears] = useLazyGetYearsQuery();

    const fetchUsersData = useCallback(async () => {
        try {
            if (!user) return;
            const params = {
                faculty_id: selectedFaculty
                    ? Number(selectedFaculty)
                    : undefined,
                department_id: selectedDepartment
                    ? Number(selectedDepartment)
                    : undefined,
                year_id: selectedYear ? Number(selectedYear) : undefined,
            };
            if (!user?.canAccessAll) {
                params.faculty_id = user.faculty?.id ?? undefined;
                params.department_id = user.department?.id ?? undefined;
                params.year_id = user.year?.id ?? undefined;
            }
            await getUsersData({
                data: params,
            }).unwrap();
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [selectedFaculty, selectedDepartment, selectedYear, user, getUsersData]);

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
            if (!user?.canAccessAll || !selectedFaculty) {
                setDepartments([]);
                return;
            }
            const result = await searchDepartments({
                data: { faculty_id: Number(selectedFaculty) },
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, user?.canAccessAll, selectedFaculty]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({ data: {} }).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchYears]);

    const fetchUsers = useCallback(async () => {
        try {
            if (!hasNextPage || !user) return;
            const params: {
                query?: string;
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};

            if (searchQuery) params.query = searchQuery;
            if (selectedFaculty) params.faculty_id = Number(selectedFaculty);
            if (selectedDepartment)
                params.department_id = Number(selectedDepartment);
            if (selectedYear) params.year_id = Number(selectedYear);

            if (!user.canAccessAll) {
                params.faculty_id = user.faculty?.id ?? undefined;
                params.department_id = user.department?.id ?? undefined;
                params.year_id = user.year?.id ?? undefined;
            }

            const result = await getUsers({
                data: params,
                includes: ["role"],
                page,
            }).unwrap();
            setUsers((prev) => {
                const filteredPrev = prev.filter(
                    (user) =>
                        !result.data?.some((newUser) => newUser.id === user.id),
                );
                if (page === 1) return result.data || [];
                return [...filteredPrev, ...(result.data || [])];
            });
            setHasNextPage(result.next_page || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [
        getUsers,
        searchQuery,
        selectedFaculty,
        selectedDepartment,
        selectedYear,
        page,
        hasNextPage,
        user,
    ]);

    const authFacultiesQuery = useCallback(
        () => fetchFaculties(),
        [fetchFaculties],
    );
    const authDepartmentsQuery = useCallback(
        () => fetchDepartments(),
        [fetchDepartments],
    );
    const authYearsQuery = useCallback(() => fetchYears(), [fetchYears]);

    const authUsersQuery = useCallback(
        () => Promise.all([fetchUsers(), fetchUsersData()]),
        [fetchUsers, fetchUsersData],
    );

    useAuthQuery(authFacultiesQuery);
    useAuthQuery(authDepartmentsQuery);
    useAuthQuery(authYearsQuery);
    useAuthQuery(authUsersQuery);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, selectedFaculty, selectedDepartment, selectedYear]);

    const facultyOptions = useMemo(() => {
        return [
            { value: "", label: "All Faculties" },
            ...faculties.map((f: FacultyResponseDto) => ({
                value: String(f.id),
                label: f.name || "",
            })),
        ];
    }, [faculties]);

    const departmentOptions = useMemo(() => {
        return [
            { value: "", label: "All Departments" },
            ...departments.map((d: DepartmentResponseDto) => ({
                value: String(d.id),
                label: d.name || "",
            })),
        ];
    }, [departments]);

    const yearOptions = useMemo(() => {
        return [
            { value: "", label: "All Years" },
            ...years.map((y: YearResponseDto) => ({
                value: String(y.id),
                label: y.year?.toString() || "",
            })),
        ];
    }, [years]);

    const stats = useMemo(() => {
        return usersStatsData?.data;
    }, [usersStatsData]);

    const handlePagination = () => {
        if (hasNextPage && !isFetching && users.length > 0) {
            setPage(page + 1);
        }
    };

    const getRoleBadgeClass = useCallback((roleName: string) => {
        const lowerRole = roleName.toLowerCase();
        if (lowerRole.includes("admin")) return styles.roleAdmin;
        if (lowerRole.includes("student")) return styles.roleStudent;
        return styles.roleDefault;
    }, []);

    const tableData = useMemo(() => {
        return users.map((user: UserResponseDto) => ({
            data: [
                user.name || "N/A",
                user.phone || "N/A",
                <span key={user.id} className={styles.tableEmail}>
                    {user.email || "N/A"}
                </span>,
                <span
                    key={`${user.id}-role`}
                    className={getRoleBadgeClass(user.role?.name || "")}
                >
                    {user.role?.name || "N/A"}
                </span>,
            ],
            onClick: () => navigate(`/admin/users/${user.id}`),
        }));
    }, [users, getRoleBadgeClass, navigate]);

    return (
        <Layout>
            <PageSeo
                title="Users Management - CU Portal"
                description="Search, Filter, Approve, And Update Users All In One Place"
            />

            <Banner
                title="Users Management"
                description="Search, Filter, Approve, And Update Users All In One Place"
            />
            <section className={styles.infoCardsContainer}>
                <div className={styles.infoCardsRow}>
                    <div className={styles.infoCard}>
                        <div className={styles.infoCardIcon}>
                            <IconComponent icon="users-total" size={48} />
                        </div>
                        <div className={styles.infoCardContent}>
                            <div className={styles.infoCardTitle}>
                                Total Users
                            </div>
                            <div className={styles.infoCardValue}>
                                {stats?.users_count || 0}
                            </div>
                            <div className={styles.infoCardGrowth}>
                                <IconComponent
                                    icon="arrow-up"
                                    color="green"
                                    size={16}
                                />
                                <span className={styles.infoCardGrowthText}>
                                    {stats?.percentage_increase || 0}% This
                                    Month
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardIcon}>
                            <IconComponent icon="pending-clock-new" size={48} />
                        </div>
                        <div className={styles.infoCardContent}>
                            <div className={styles.infoCardTitle}>
                                Pending Requests
                            </div>
                            <div className={styles.infoCardValue}>
                                {stats?.pending_users_count || 0}
                            </div>
                            <Link
                                to="/admin/users/pending"
                                style={{ textDecoration: "none" }}
                            >
                                <div className={styles.infoCardAction}>
                                    <IconComponent
                                        icon="eye-review"
                                        className={styles.infoCardReviewEye}
                                    />
                                    <span className={styles.infoCardReview}>
                                        Review Now
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <section className={styles.filtersSection}>
                <div className={styles.filtersBg}></div>
                <div className={styles.filtersRow}>
                    <div className={styles.filterSearch}>
                        <Search
                            placeholder="Search by name, email or phone number..."
                            setValue={setSearchQuery}
                            value={searchQuery}
                        />
                    </div>
                    {user?.canAccessAll && (
                        <div className={styles.filtersGroup}>
                            <div className={styles.filterItem}>
                                <SelectFilter
                                    value={selectedFaculty}
                                    setValue={(value) =>
                                        setFilters({
                                            faculty_id: value as string,
                                            department_id: null,
                                        })
                                    }
                                    options={facultyOptions}
                                />
                            </div>
                            <div className={styles.filterItem}>
                                <SelectFilter
                                    value={selectedDepartment}
                                    setValue={setSelectedDepartment}
                                    options={departmentOptions}
                                    disabled={!selectedFaculty}
                                />
                            </div>
                            <div className={styles.filterItem}>
                                <SelectFilter
                                    value={selectedYear}
                                    setValue={setSelectedYear}
                                    options={yearOptions}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className={styles.tableSection}>
                {
                    <Table
                        columns={["Name", "Phone", "E-Mail", "Role"]}
                        data={tableData}
                        action={true}
                    />
                }
            </section>

            <Pagination onReached={handlePagination} />
        </Layout>
    );
};
