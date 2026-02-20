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
    useLazyGetUsersDataQuery,
} from "../../../services/apis/admin/UserAPIs";
import { useLazySearchFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazySearchDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazySearchYearsQuery } from "../../../services/apis/admin/YearAPIs";
import type { User } from "../../../types/entities/User";
import type { Faculty } from "../../../types/entities/Faculty";
import type { Department } from "../../../types/entities/Department";
import type { Year } from "../../../types/entities/Year";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import usersTotalIcon from "../../../assets/icons/users-total.png";
import monitorIcon from "../../../assets/icons/monitor.png";
import pendingClockIcon from "../../../assets/icons/pending-clock-new.png";
import eyeReviewIcon from "../../../assets/icons/eye-review.png";
import arrowUpIcon from "../../../assets/icons/arrow-up.png";
import { Avatar } from "../../../components/avatar/Avatar";
import { Table } from "../../../components/table/Table";
import { useAppSelector } from "../../../services/redux/Hooks";
import styles from "./UsersPage.module.css";

export const UsersPage = () => {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);

    const [getUsers, { isFetching }] = useLazyGetUsersQuery();
    const [getUsersData, { data: usersStatsData }] = useLazyGetUsersDataQuery();
    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();

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
                params.faculty_id = user.faculty?.id;
                params.department_id = user.department?.id;
                params.year_id = user.year?.id;
            }
            await getUsersData({
                ...params,
            }).unwrap();
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [selectedFaculty, selectedDepartment, selectedYear, user, getUsersData]);

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
            if (!selectedFaculty) {
                setDepartments([]);
                return;
            }
            const result = await searchDepartments({
                faculty_id: Number(selectedFaculty),
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, selectedFaculty]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({}).unwrap();
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
                page?: number;
            } = { page };

            if (searchQuery) params.query = searchQuery;
            if (selectedFaculty) params.faculty_id = Number(selectedFaculty);
            if (selectedDepartment)
                params.department_id = Number(selectedDepartment);
            if (selectedYear) params.year_id = Number(selectedYear);

            if (!user.canAccessAll) {
                params.faculty_id = user.faculty?.id;
                params.department_id = user.department?.id;
                params.year_id = user.year?.id;
            }

            const result = await getUsers(params).unwrap();
            setUsers((prev) => {
                const filteredPrev = prev.filter(
                    (user) =>
                        !result.data?.some((newUser) => newUser.id === user.id),
                );
                if (page === 1) return result.data || [];
                return [...filteredPrev, ...(result.data || [])];
            });
            setHasNextPage(result.next || false);
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

    const authQueryParams = useCallback(
        () =>
            Promise.all([
                fetchUsers(),
                fetchUsersData(),
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
            ]),
        [
            fetchUsers,
            fetchUsersData,
            fetchFaculties,
            fetchDepartments,
            fetchYears,
        ],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery, selectedFaculty, selectedDepartment, selectedYear]);

    const facultyOptions = useMemo(() => {
        return [
            { value: "", label: "All Faculties" },
            ...faculties.map((f: Faculty) => ({
                value: String(f.id),
                label: f.name || "",
            })),
        ];
    }, [faculties]);

    const departmentOptions = useMemo(() => {
        return [
            { value: "", label: "All Departments" },
            ...departments.map((d: Department) => ({
                value: String(d.id),
                label: d.name || "",
            })),
        ];
    }, [departments]);

    const yearOptions = useMemo(() => {
        return [
            { value: "", label: "All Years" },
            ...years.map((y: Year) => ({
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
        return users.map((user: User) => ({
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
                            <img src={usersTotalIcon} alt="Users" />
                        </div>
                        <div className={styles.infoCardContent}>
                            <div className={styles.infoCardTitle}>
                                Total Users
                            </div>
                            <div className={styles.infoCardValue}>
                                {stats?.users_count || 0}
                            </div>
                            <div className={styles.infoCardGrowth}>
                                <img src={arrowUpIcon} alt="Up" />
                                <span className={styles.infoCardGrowthText}>
                                    {stats?.percentage_increase || 0}% This
                                    Month
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardIcon}>
                            <img src={monitorIcon} alt="Active Now" />
                        </div>
                        <div className={styles.infoCardContent}>
                            <div className={styles.infoCardTitle}>
                                Active Now
                            </div>
                            <div className={styles.infoCardValue}>
                                {stats?.active_now || 0}
                            </div>
                            <div className={styles.infoCardAvatars}>
                                {stats?.last_five_users_active?.map(
                                    (avatarUrl, idx) => (
                                        <Avatar
                                            key={idx}
                                            url={avatarUrl}
                                            size="medium"
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.infoCardIcon}>
                            <img
                                src={pendingClockIcon}
                                alt="Pending Requests"
                            />
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
                                    <img
                                        src={eyeReviewIcon}
                                        alt="Review"
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
                        />
                    </div>
                    {user?.canAccessAll && (
                        <div className={styles.filtersGroup}>
                            <div className={styles.filterItem}>
                                <SelectFilter
                                    value={selectedFaculty}
                                    setValue={setSelectedFaculty}
                                    options={facultyOptions}
                                />
                            </div>
                            <div className={styles.filterItem}>
                                <SelectFilter
                                    value={selectedDepartment}
                                    setValue={setSelectedDepartment}
                                    options={departmentOptions}
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
