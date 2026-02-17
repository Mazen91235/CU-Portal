import { useState, useEffect, useMemo, useCallback } from "react";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { ImgPreviewer } from "../../../components/preview/ImgPreviewer";
import { Pagination } from "../../../components/pagination/Pagination";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import {
    useLazyGetUsersQuery,
    useUpdateUsersMutation,
} from "../../../services/apis/admin/UserAPIs";
import { useLazySearchFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazySearchDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazySearchYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { showToast } from "../../../utils/ToastsManager";
import type { User } from "../../../types/entities/User";
import type { Faculty } from "../../../types/entities/Faculty";
import type { Department } from "../../../types/entities/Department";
import type { Year } from "../../../types/entities/Year";
import { GetDriveIdFromUrl } from "../../../utils/DriveManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import badgeFacultyIcon from "../../../assets/icons/badge-faculty.png";
import badgeDepartmentIcon from "../../../assets/icons/badge-department.png";
import badgeYearIcon from "../../../assets/icons/badge-year.png";
import badgeIdCardIcon from "../../../assets/icons/badge-id-card.png";
import badgeViewIcon from "../../../assets/icons/badge-view.png";
import { useAppSelector } from "../../../services/redux/Hooks";
import styles from "./PendingUsersPage.module.css";

export const PendingUsersPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const user = useAppSelector((state) => state.user.user);
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [imagePreview, setImagePreview] = useState<{
        isOpen: boolean;
        url: string;
    }>({
        isOpen: false,
        url: "",
    });
    const [showApproveAllModal, setShowApproveAllModal] = useState(false);
    const [showRejectAllModal, setShowRejectAllModal] = useState(false);

    const [getPendingUsers, { isFetching }] = useLazyGetUsersQuery();
    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    const [updateUsers] = useUpdateUsersMutation();

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
            const params: { faculty_id?: number } = {};
            if (!selectedFaculty) {
                setDepartments([]);
                return;
            }
            params.faculty_id = Number(selectedFaculty);
            const result = await searchDepartments(params).unwrap();
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

    const fetchPendingUsers = useCallback(async () => {
        try {
            if (!hasNextPage || !user) return;
            const params: {
                query?: string;
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
                is_active?: boolean;
                page?: number;
            } = { is_active: false, page };

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

            const result = await getPendingUsers(params).unwrap();
            setPendingUsers((prev) => {
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
        getPendingUsers,
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
                fetchPendingUsers(),
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
            ]),
        [fetchPendingUsers, fetchFaculties, fetchDepartments, fetchYears],
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

    const handleViewImage = (imageUrl: string) => {
        try {
            const fileId = GetDriveIdFromUrl(imageUrl);
            const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            setImagePreview({ isOpen: true, url: thumbnailUrl });
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleApprove = async (userId: number) => {
        try {
            await updateUsers({
                data_to_update: [{ id: userId, approved: true }],
            }).unwrap();
            showToast("success", "Success", "User approved successfully");
            setHasNextPage(true);
            await fetchPendingUsers();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleReject = async (userId: number) => {
        try {
            await updateUsers({
                data_to_update: [{ id: userId, approved: false }],
            }).unwrap();
            showToast("success", "Success", "User rejected successfully");
            setHasNextPage(true);
            await fetchPendingUsers();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleApproveAll = async () => {
        try {
            if (!user) return;
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};
            if (!user.canAccessAll) {
                params.faculty_id = user.faculty?.id;
                params.department_id = user.department?.id;
                params.year_id = user.year?.id;
            }
            const result = await getPendingUsers({
                ...params,
                is_active: false,
                limit: Infinity,
            }).unwrap();
            const pendingUsers = result.data || [];
            await updateUsers({
                data_to_update: pendingUsers.map((user) => ({
                    id: user.id,
                    approved: true,
                })),
            }).unwrap();
            showToast("success", "Success", "All users approved successfully");
            setPendingUsers([]);
            setShowApproveAllModal(false);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleRejectAll = async () => {
        try {
            if (!user) return;
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};
            if (!user.canAccessAll) {
                params.faculty_id = user.faculty?.id;
                params.department_id = user.department?.id;
                params.year_id = user.year?.id;
            }
            const result = await getPendingUsers({
                ...params,
                is_active: false,
                limit: Infinity,
            }).unwrap();
            const pendingUsers = result.data || [];
            await updateUsers({
                data_to_update: pendingUsers.map((user) => ({
                    id: user.id,
                    approved: false,
                })),
            }).unwrap();
            showToast("success", "Success", "All users rejected successfully");
            setPendingUsers([]);
            setShowRejectAllModal(false);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handlePagination = () => {
        if (hasNextPage && !isFetching && pendingUsers.length > 0) {
            setPage(page + 1);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Pending Requests - CU Portal"
                description="Accept, Reject or View Pending Requests all in one place"
            />

            <Banner
                title="Pending Requests"
                description="Accept, Reject or View Pending Requests all in one place"
            />

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

            <section className={styles.pendingSection}>
                <div className={styles.pendingCard}>
                    <div className={styles.pendingHeader}>
                        <h2 className={styles.pendingTitle}>
                            <i className="fa fa-clock-rotate-left"></i> Pending
                            Applications ({pendingUsers.length})
                        </h2>
                        {pendingUsers.length > 0 && (
                            <div className={styles.pendingHeaderActions}>
                                <button
                                    className={styles.approveAllBtn}
                                    onClick={() => setShowApproveAllModal(true)}
                                >
                                    <i className="fa fa-check"></i>
                                    Approve All
                                </button>
                                <button
                                    className={styles.rejectAllBtn}
                                    onClick={() => setShowRejectAllModal(true)}
                                >
                                    <i className="fa fa-times"></i>
                                    Reject All
                                </button>
                            </div>
                        )}
                    </div>

                    {isFetching && pendingUsers.length === 0 ? (
                        <div className={styles.emptyState}>Loading...</div>
                    ) : pendingUsers.length === 0 ? (
                        <div className={styles.emptyState}>
                            No pending users found
                        </div>
                    ) : (
                        <div className={styles.pendingUsersContainer}>
                            {pendingUsers.map((user: User) => (
                                <div
                                    key={user.id}
                                    className={styles.pendingMiniCard}
                                >
                                    <img
                                        className={styles.pendingMiniAvatar}
                                        src={
                                            user.details?.avatar ||
                                            user.google_avatar ||
                                            "https://via.placeholder.com/72"
                                        }
                                        alt="Avatar"
                                    />
                                    <div className={styles.pendingMiniContent}>
                                        <div className={styles.pendingMiniName}>
                                            {user.name || "N/A"}
                                        </div>
                                        <div
                                            className={
                                                styles.pendingMiniEmailPhone
                                            }
                                        >
                                            <span>
                                                <i className="fa fa-envelope"></i>{" "}
                                                {user.email || "N/A"}
                                            </span>
                                            <span>
                                                <i className="fa fa-phone"></i>{" "}
                                                {user.phone || "N/A"}
                                            </span>
                                        </div>
                                        <div
                                            className={styles.pendingMiniBadges}
                                        >
                                            <span
                                                className={
                                                    styles.pendingMiniBadgeEngineering
                                                }
                                            >
                                                <img
                                                    src={badgeFacultyIcon}
                                                    alt="Faculty"
                                                />
                                                <span>
                                                    {user.faculty?.name ||
                                                        "N/A"}
                                                </span>
                                            </span>
                                            <span
                                                className={
                                                    styles.pendingMiniBadgeSecondary
                                                }
                                            >
                                                <img
                                                    src={badgeDepartmentIcon}
                                                    alt="Department"
                                                />
                                                {user.department?.name || "N/A"}
                                            </span>
                                            <span
                                                className={
                                                    styles.pendingMiniBadgeYear
                                                }
                                            >
                                                <img
                                                    src={badgeYearIcon}
                                                    alt="Year"
                                                />
                                                {user.year?.year || "N/A"}
                                            </span>
                                        </div>
                                        <div
                                            className={styles.pendingMiniIdRow}
                                        >
                                            <span
                                                className={
                                                    styles.pendingMiniIdLabel
                                                }
                                            >
                                                <img
                                                    src={badgeIdCardIcon}
                                                    alt="ID Card"
                                                />
                                                University ID Card
                                            </span>
                                            <button
                                                className={
                                                    styles.pendingMiniIdBtn
                                                }
                                                onClick={() =>
                                                    user.pending_user?.url &&
                                                    handleViewImage(
                                                        user.pending_user.url,
                                                    )
                                                }
                                            >
                                                <img
                                                    src={badgeViewIcon}
                                                    alt="View"
                                                />
                                                View Image
                                            </button>
                                        </div>
                                        <div
                                            className={
                                                styles.pendingMiniActionsRow
                                            }
                                        >
                                            <button
                                                className={styles.approveBtn}
                                                onClick={() =>
                                                    handleApprove(user.id!)
                                                }
                                            >
                                                <i className="fa fa-check"></i>
                                                Approve
                                            </button>
                                            <button
                                                className={styles.rejectBtn}
                                                onClick={() =>
                                                    handleReject(user.id!)
                                                }
                                            >
                                                <i className="fa fa-times"></i>
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Pagination onReached={handlePagination} />

            {imagePreview.isOpen && (
                <ImgPreviewer
                    isOpen={imagePreview.isOpen}
                    imageSrc={imagePreview.url}
                    onClose={() => setImagePreview({ isOpen: false, url: "" })}
                />
            )}

            <ConfirmModal
                isOpen={showApproveAllModal}
                onClose={() => setShowApproveAllModal(false)}
                onConfirm={handleApproveAll}
                confirmText="Approve All"
                title="Approve All Users?"
                message={`Are you sure you want to approve all ${pendingUsers.length} pending users?`}
                colorType="green"
            />

            <ConfirmModal
                isOpen={showRejectAllModal}
                onClose={() => setShowRejectAllModal(false)}
                onConfirm={handleRejectAll}
                confirmText="Reject All"
                title="Reject All Users?"
                message={`Are you sure you want to reject all ${pendingUsers.length} pending users? This action cannot be undone.`}
                colorType="red"
            />
        </Layout>
    );
};
