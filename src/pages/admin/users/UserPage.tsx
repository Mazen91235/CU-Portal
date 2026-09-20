import { useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { Button } from "../../../components/forms/Button";
import {
    useLazyGetUserQuery,
    useUpdateUsersMutation,
    useSuspendUserMutation,
    useUnsuspendUserMutation,
} from "../../../services/apis/admin/UserAPIs";
import { useLazyGetRolesQuery } from "../../../services/apis/admin/RoleAPIs";
import { showToast } from "../../../utils/ToastsManager";
import { getErrorMessage, handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type {
    UserResponseDto,
    UserGetUserWithDetailsDto,
} from "../../../types/dtos/UserDtos";
import type { RoleResponseDto } from "../../../types/dtos/RoleDtos";
import IconComponent from "../../../components/IconComponent";
import styles from "./UserPage.module.css";
import z from "zod";
import { Form } from "../../../components/forms/Form";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { Select } from "../../../components/forms/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Avatar } from "../../../components/avatar/Avatar";
import {
    formatDateTime,
    formatString,
    formatTimeAgo,
} from "../../../utils/Formatter";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { useAppSelector } from "../../../services/redux/Hooks";

export const UserPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [user, setUser] = useState<UserGetUserWithDetailsDto>({});
    const [roles, setRoles] = useState<RoleResponseDto[]>([]);
    const permissions = useAppSelector((state) => state.user.permissions);
    const canManageUsers = permissions?.includes("Manage Users") ?? false;

    const [getUser] = useLazyGetUserQuery();
    const [getRoles] = useLazyGetRolesQuery();
    const [updateUser] = useUpdateUsersMutation();
    const [suspendUser, { isLoading: isSuspendingUser }] =
        useSuspendUserMutation();
    const [unsuspendUser, { isLoading: isUnsuspendingUser }] =
        useUnsuspendUserMutation();
    const [userStatusAction, setUserStatusAction] = useState<
        "suspend" | "unsuspend" | null
    >(null);

    const schema = z.object({
        roleId: z.string().min(1, "Role is required"),
    });

    type RoleFormData = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm<RoleFormData>({
        resolver: zodResolver(schema),
    });

    const fetchUserData = useCallback(async () => {
        if (!userId) return;
        try {
            const result = await getUser({ user_id: Number(userId) }).unwrap();
            const user = result.data;
            if (!user) {
                navigate("/admin/users", {
                    state: { error: "Failed to fetch user data" },
                });
                return;
            }
            setUser(user);
        } catch (error) {
            navigate("/admin/users", {
                state: { error: getErrorMessage(error) || "Failed to fetch user data" },
            });
        }
    }, [userId, getUser, navigate]);

    const fetchRoles = useCallback(async () => {
        try {
            const result = await getRoles({}).unwrap();
            setRoles(result.data || []);
        } catch (error) {
            const res = error as DefaultAPIResponse;
            navigate("/admin/users", {
                state: {
                    error: res.data?.message || "Failed to fetch roles data",
                },
            });
        }
    }, [getRoles, navigate]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchUserData(), fetchRoles()]),
        [fetchUserData, fetchRoles],
    );

    useAuthQuery(authQueryParams);

    const handleEditRole = () => {
        setIsEditingRole(true);
        setValue("roleId", user.role?.id?.toString() || "");
    };

    const handleCancelEdit = () => {
        setIsEditingRole(false);
    };

    const onSubmit = async (data: RoleFormData) => {
        if (!userId) return;
        try {
            await updateUser({
                data_to_update: [
                    {
                        id: Number(userId),
                        approved: true,
                        role_id: Number(data.roleId),
                    },
                ],
            }).unwrap();
            showToast("success", "Success", "User role updated successfully");
            setIsEditingRole(false);
            await fetchUserData();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleUserStatusConfirm = async () => {
        if (!userId || !userStatusAction) return;

        try {
            if (userStatusAction === "suspend") {
                await suspendUser({ user_id: Number(userId) }).unwrap();
                showToast("success", "Success", "User suspended successfully");
            } else {
                await unsuspendUser({ user_id: Number(userId) }).unwrap();
                showToast(
                    "success",
                    "Success",
                    "User unsuspended successfully",
                );
            }
            setUserStatusAction(null);
            await fetchUserData();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Layout>
            <PageSeo
                title={`${user.name || "User"} - CU Portal`}
                description="View and manage user details"
            />

            <SubBanner
                title={user.name || "User Details"}
                description="View and manage user information"
                icon="user"
                linkText="Back to Users"
                linkTo="/admin/users"
            />

            <div className={styles.userDetailsCard}>
                <div className={styles.userDetailsCardHeader}>
                    <div className={styles.userRoleContainer}>
                        {!isEditingRole ? (
                            <>
                                <div className={styles.userRoleLeft}>
                                    <span className={styles.userBadge}>
                                        {formatString(
                                            user.role?.name || "User",
                                            "CardTitle",
                                        )}
                                    </span>
                                    {user.is_early_access && (
                                        <span
                                            className={
                                                styles.userEarlyAccessBadge
                                            }
                                        >
                                            Early Access
                                        </span>
                                    )}
                                </div>
                                {canManageUsers &&
                                    (user.status ? (
                                        <div className={styles.userRoleActions}>
                                            <button
                                                type="button"
                                                className={
                                                    styles.suspendUserBtn
                                                }
                                                onClick={() =>
                                                    setUserStatusAction(
                                                        "suspend",
                                                    )
                                                }
                                                disabled={isSuspendingUser}
                                            >
                                                Suspend User
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.editRoleBtn}
                                                onClick={handleEditRole}
                                            >
                                                Edit Role
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.userRoleActions}>
                                            <button
                                                type="button"
                                                className={
                                                    styles.unsuspendUserBtn
                                                }
                                                onClick={() =>
                                                    setUserStatusAction(
                                                        "unsuspend",
                                                    )
                                                }
                                                disabled={isUnsuspendingUser}
                                            >
                                                Unsuspend User
                                            </button>
                                        </div>
                                    ))}
                            </>
                        ) : (
                            <Form
                                onSubmit={handleSubmit(onSubmit)}
                                errors={errors}
                                disabled={isSubmitting}
                                className={styles.roleForm}
                                containerClassName={styles.roleFormContainer}
                            >
                                <Select
                                    register={register}
                                    name="roleId"
                                    errors={errors}
                                    disabled={isSubmitting}
                                    className={styles.roleSelect}
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option
                                            value={role.id ?? 0}
                                            key={role.id}
                                        >
                                            {role.name}
                                        </option>
                                    ))}
                                </Select>
                                <div className={styles.roleFormActions}>
                                    <Button
                                        type="submit"
                                        text="Update Role"
                                        loadingText="Updating..."
                                        isSubmitting={isSubmitting}
                                        isOrange={false}
                                    />
                                    <Button
                                        type="button"
                                        text="Cancel"
                                        loadingText=""
                                        isSubmitting={false}
                                        onClick={handleCancelEdit}
                                        isDefault={true}
                                    />
                                </div>
                            </Form>
                        )}
                    </div>
                </div>

                <div className={styles.userDetailsMainRow}>
                    <div className={styles.userDetailsAvatarWrapper}>
                        <Avatar user={user as UserResponseDto} size="large" />
                    </div>
                    <div className={styles.userDetailsInfoTableWrapper}>
                        <table className={styles.userDetailsInfoTable}>
                            <tbody>
                                <tr>
                                    <td className={styles.userDetailsLabel}>
                                        <IconComponent icon="user" /> Name:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {formatString(user.name, "CardContent")}
                                    </td>
                                    <td className={styles.userDetailsLabel}>
                                        <IconComponent icon="mail-details" />{" "}
                                        E-Mail:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {formatString(
                                            user.email,
                                            "CardContent",
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.userDetailsLabel}>
                                        <IconComponent icon="call-details" />{" "}
                                        Phone:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {formatString(
                                            user.phone,
                                            "CardContent",
                                        )}
                                    </td>
                                    <td className={styles.userDetailsLabel}>
                                        <IconComponent icon="building" />{" "}
                                        Faculty:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {formatString(
                                            user.faculty?.name,
                                            "CardContent",
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.userDetailsLabel}>
                                        <IconComponent icon="building-department" />{" "}
                                        Department:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {formatString(
                                            user.department?.name,
                                            "CardContent",
                                        )}
                                    </td>
                                    <td className={styles.userDetailsLabel}>
                                        <IconComponent icon="certificate-year" />{" "}
                                        Academic Year:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {formatString(
                                            user.year?.year?.toString(),
                                            "CardContent",
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.userDetailsLabel}>
                                        <IconComponent icon="id-card-details" />
                                        Is Active:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {formatString(
                                            user.status ? "Yes" : "No",
                                            "CardContent",
                                        )}
                                    </td>
                                    <td className={styles.userDetailsLabel}>
                                        <IconComponent icon="iconsax-calendar" />{" "}
                                        Joined At:
                                    </td>
                                    <td>
                                        {formatDateTime(user.created_at) ||
                                            "N/A"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className={styles.sectionsRow}>
                <section className={styles.section}>
                    <div className={styles.examsSection}>
                        <div className={styles.examsHeader}>
                            <span className={styles.examsHeaderIcon}>
                                <IconComponent icon="exam-icon" />
                            </span>
                            <span className={styles.examsHeaderTitle}>
                                Exams
                            </span>
                            <Link
                                to={`/admin/exams?author_id=${userId}`}
                                className={styles.viewAllLink}
                            >
                                View All
                            </Link>
                        </div>
                        <div className={styles.examsListPublished}>
                            {user.exams_published &&
                            user.exams_published.length > 0 ? (
                                user.exams_published.map((exam) => {
                                    const deadline = new Date(
                                        formatDateTime(exam.deadline, true),
                                    );
                                    const today = new Date();
                                    const type =
                                        deadline < today
                                            ? "Complete"
                                            : "Upcoming";
                                    return (
                                        <div
                                            key={exam.id}
                                            className={`${styles.examCard} ${styles.examCardWhiteBg}`}
                                        >
                                            <div
                                                className={styles.examCardIcon}
                                            >
                                                <IconComponent
                                                    icon="exam-icon"
                                                    className={
                                                        styles.examCircleIcon
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={styles.examCardInfo}
                                            >
                                                <div
                                                    className={
                                                        styles.examCardTitle
                                                    }
                                                >
                                                    {formatString(
                                                        exam.name,
                                                        "CardTitle",
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.examCardSubject
                                                    }
                                                >
                                                    {formatString(
                                                        exam.subject?.name,
                                                        "CardDescription",
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.examCardDate
                                                    }
                                                >
                                                    Due:{" "}
                                                    {exam.deadline
                                                        ? formatDateTime(
                                                              exam.deadline,
                                                          )
                                                        : "N/A"}
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.examCardBadges
                                                }
                                            >
                                                <span
                                                    className={`${styles.examBadge} ${styles.examBadgePublisher}`}
                                                >
                                                    Publisher
                                                </span>
                                                <span
                                                    className={`${styles.examBadge} ${type === "Complete" ? styles.examBadgeComplete : styles.examBadgeUpcoming}`}
                                                >
                                                    {type || "Pending"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={styles.emptySection}>
                                    No exams published
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.tasksSection}>
                        <div className={styles.tasksHeader}>
                            <IconComponent
                                icon="task-details-icon"
                                className={styles.tasksHeaderIcon}
                            />
                            <span className={styles.tasksHeaderTitle}>
                                Tasks
                            </span>
                            <Link
                                to={`/admin/tasks?author_id=${userId}`}
                                className={styles.viewAllLink}
                            >
                                View All
                            </Link>
                        </div>
                        <div className={styles.tasksListPublished}>
                            {user.tasks_published &&
                            user.tasks_published.length > 0 ? (
                                user.tasks_published.map((task) => {
                                    const deadline = new Date(
                                        formatDateTime(task.deadline, true),
                                    );
                                    const today = new Date();
                                    const type =
                                        deadline < today
                                            ? "Complete"
                                            : "Upcoming";
                                    return (
                                        <div
                                            key={task.id}
                                            className={`${styles.taskCard} ${styles.taskCardWhiteBg}`}
                                        >
                                            <div
                                                className={styles.taskCardIcon}
                                            >
                                                <IconComponent
                                                    icon="task-details-icon"
                                                    className={
                                                        styles.taskCircleIcon
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={styles.taskCardInfo}
                                            >
                                                <div
                                                    className={
                                                        styles.taskCardTitle
                                                    }
                                                >
                                                    {formatString(
                                                        task.name,
                                                        "CardTitle",
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.taskCardSubject
                                                    }
                                                >
                                                    {formatString(
                                                        task.subject?.name,
                                                        "CardDescription",
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.taskCardDate
                                                    }
                                                >
                                                    Due:{" "}
                                                    {task.deadline
                                                        ? formatDateTime(
                                                              task.deadline,
                                                          )
                                                        : "N/A"}
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.taskCardBadges
                                                }
                                            >
                                                <span
                                                    className={`${styles.taskBadge} ${styles.taskBadgePublisher}`}
                                                >
                                                    Publisher
                                                </span>
                                                <span
                                                    className={`${styles.taskBadge} ${type === "Complete" ? styles.taskBadgeComplete : type === "Upcoming" ? styles.taskBadgeUpcoming : styles.taskBadgePending}`}
                                                >
                                                    {type || "Pending"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={styles.emptySection}>
                                    No tasks published
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <div className={styles.sectionsRow}>
                <section className={styles.section}>
                    <div className={styles.announcementSection}>
                        <div className={styles.announcementHeader}>
                            <IconComponent
                                icon="announcement-icon"
                                className={styles.announcementHeaderIcon}
                            />
                            <span className={styles.announcementHeaderTitle}>
                                Announcements
                            </span>
                            <Link
                                to={`/admin/announcements?author_id=${userId}`}
                                className={styles.viewAllLink}
                            >
                                View All
                            </Link>
                        </div>
                        <div className={styles.announcementList}>
                            {user.announcements_published &&
                            user.announcements_published.length > 0 ? (
                                user.announcements_published.map(
                                    (announcement, index) => (
                                        <div
                                            key={announcement.id}
                                            className={styles.announcementCard}
                                        >
                                            <div
                                                className={`${styles.announcementCardBorder} ${index % 2 === 0 ? styles.announcementBorderBlue : styles.announcementBorderRed}`}
                                            ></div>
                                            <div
                                                className={
                                                    styles.announcementCardContent
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.announcementCardTitleRow
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.announcementCardTitle
                                                        }
                                                    >
                                                        {formatString(
                                                            announcement.title,
                                                            "CardTitle",
                                                        )}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.announcementBadge
                                                        }
                                                    >
                                                        Publisher
                                                    </span>
                                                </div>
                                                <div
                                                    className={
                                                        styles.announcementCardDesc
                                                    }
                                                >
                                                    {formatString(
                                                        announcement.content ||
                                                            "No content",
                                                        "CardDescription",
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.announcementCardDate
                                                    }
                                                >
                                                    Posted{" "}
                                                    {announcement.created_at
                                                        ? formatTimeAgo(
                                                              announcement.created_at,
                                                          )
                                                        : "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )
                            ) : (
                                <div className={styles.emptySection}>
                                    No announcements published
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <section className={styles.section}>
                    <div className={styles.eventsSection}>
                        <div className={styles.eventsHeader}>
                            <span className={styles.eventsHeaderIcon}>
                                <IconComponent icon="calendar" />
                            </span>
                            <span className={styles.eventsHeaderTitle}>
                                Events
                            </span>
                            <Link
                                to={`/admin/events?author_id=${userId}`}
                                className={styles.viewAllLink}
                            >
                                View All
                            </Link>
                        </div>
                        <div className={styles.eventsListPublished}>
                            {user.events && user.events.length > 0 ? (
                                user.events.map((event) => {
                                    const now = new Date();
                                    const startDate = event.start_date
                                        ? new Date(event.start_date)
                                        : null;
                                    const endDate = event.end_date
                                        ? new Date(event.end_date)
                                        : null;
                                    const state =
                                        !startDate || !endDate
                                            ? "Pending"
                                            : now < startDate
                                              ? "Upcoming"
                                              : now <= endDate
                                                ? "Ongoing"
                                                : "Complete";
                                    return (
                                        <div
                                            key={event.id}
                                            className={`${styles.eventCard} ${styles.eventCardWhiteBg}`}
                                        >
                                            <div
                                                className={styles.eventCardIcon}
                                            >
                                                <IconComponent
                                                    icon="calendar"
                                                    className={
                                                        styles.eventCircleIcon
                                                    }
                                                />
                                            </div>
                                            <div
                                                className={styles.eventCardInfo}
                                            >
                                                <div
                                                    className={
                                                        styles.eventCardTitle
                                                    }
                                                >
                                                    {formatString(
                                                        event.title,
                                                        "CardTitle",
                                                    )}
                                                </div>
                                                <div
                                                    className={
                                                        styles.eventCardDate
                                                    }
                                                >
                                                    Start:{" "}
                                                    {event.start_date
                                                        ? formatDateTime(
                                                              event.start_date,
                                                          )
                                                        : "N/A"}
                                                </div>
                                                <div
                                                    className={
                                                        styles.eventCardDate
                                                    }
                                                >
                                                    End:{" "}
                                                    {event.end_date
                                                        ? formatDateTime(
                                                              event.end_date,
                                                          )
                                                        : "N/A"}
                                                </div>
                                                <div
                                                    className={
                                                        styles.eventCardDate
                                                    }
                                                >
                                                    Organizer:{" "}
                                                    {formatString(
                                                        event.event_organizer
                                                            ?.name,
                                                        "CardDescription",
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={
                                                    styles.eventCardBadges
                                                }
                                            >
                                                <span
                                                    className={`${styles.eventBadge} ${styles.eventBadgePublished}`}
                                                >
                                                    Published
                                                </span>
                                                <span
                                                    className={`${styles.eventBadge} ${state === "Complete" ? styles.eventBadgeComplete : state === "Ongoing" ? styles.eventBadgeOngoing : state === "Upcoming" ? styles.eventBadgeUpcoming : styles.eventBadgePending}`}
                                                >
                                                    {state}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={styles.emptySection}>
                                    No events published
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <section className={styles.section}>
                    <div className={styles.materialsSection}>
                        <div className={styles.materialsHeader}>
                            <IconComponent
                                icon="materials-icon"
                                className={styles.materialsHeaderIcon}
                            />
                            <span className={styles.materialsHeaderTitle}>
                                Materials
                            </span>
                            <Link
                                to={`/admin/materials?author_id=${userId}`}
                                className={styles.viewAllLink}
                            >
                                View All
                            </Link>
                        </div>
                        <div className={styles.materialsList}>
                            {user.materials && user.materials.length > 0 ? (
                                user.materials.map((material) => (
                                    <div
                                        key={material.id}
                                        className={styles.materialsCard}
                                    >
                                        <div
                                            className={styles.materialsCardIcon}
                                        >
                                            <IconComponent
                                                icon="materials-icon"
                                                className={
                                                    styles.materialsCircleIcon
                                                }
                                            />
                                        </div>
                                        <div
                                            className={styles.materialsCardInfo}
                                        >
                                            <div
                                                className={
                                                    styles.materialsCardTitle
                                                }
                                            >
                                                {formatString(
                                                    material.name,
                                                    "CardTitle",
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    styles.materialsCardSubject
                                                }
                                            >
                                                {formatString(
                                                    material.subject?.name,
                                                    "CardDescription",
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    styles.materialsCardDateRow
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.materialsCardDate
                                                    }
                                                >
                                                    Uploaded{" "}
                                                    {material.created_at
                                                        ? formatTimeAgo(
                                                              material.created_at,
                                                          )
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                styles.materialsCardBadges
                                            }
                                        >
                                            <span
                                                className={`${styles.materialsBadge} ${styles.materialsBadgePublisher}`}
                                            >
                                                Publisher
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptySection}>
                                    No materials uploaded
                                </div>
                            )}
                        </div>
                    </div>
                </section>
                <section className={styles.section}>
                    <div className={styles.subjectsSection}>
                        <div className={styles.subjectsHeader}>
                            <IconComponent
                                icon="subjects-icon"
                                className={styles.subjectsHeaderIcon}
                            />
                            <span className={styles.subjectsHeaderTitle}>
                                Subjects
                            </span>
                            <Link
                                to={`/admin/courses?user_id=${userId}`}
                                className={styles.viewAllLink}
                            >
                                View All
                            </Link>
                        </div>
                        <div className={styles.subjectsList}>
                            {user.subjects && user.subjects.length > 0 ? (
                                user.subjects.map((subject) => (
                                    <div
                                        key={subject.id}
                                        className={styles.subjectsCard}
                                    >
                                        <div
                                            className={styles.subjectsCardIcon}
                                        >
                                            <IconComponent
                                                icon="subjects-icon"
                                                className={
                                                    styles.subjectsCircleIcon
                                                }
                                            />
                                        </div>
                                        <div
                                            className={styles.subjectsCardInfo}
                                        >
                                            <div
                                                className={
                                                    styles.subjectsCardTitle
                                                }
                                            >
                                                {formatString(
                                                    subject.name,
                                                    "CardTitle",
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    styles.subjectsCardCode
                                                }
                                            >
                                                {formatString(
                                                    subject.code,
                                                    "CardContent",
                                                )}
                                            </div>
                                            {subject.credits && (
                                                <div
                                                    className={
                                                        styles.subjectsCardCredit
                                                    }
                                                >
                                                    {formatString(
                                                        `${subject.credits} Credit Hours`,
                                                        "CardContent",
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptySection}>
                                    No subjects registered
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <div className={styles.activityLogsFullWidth}>
                <section className={styles.section}>
                    <div className={styles.activityLogsSection}>
                        <div className={styles.activityLogsHeader}>
                            <IconComponent
                                icon="activity-logs-icon"
                                className={styles.activityLogsHeaderIcon}
                            />
                            <span className={styles.activityLogsHeaderTitle}>
                                Activity Logs
                            </span>
                            <Link
                                to={`/admin/logs?user_id=${userId}`}
                                className={styles.viewAllLink}
                            >
                                View All
                            </Link>
                        </div>
                        <div className={styles.activityLogsList}>
                            {user.logs && user.logs.length > 0 ? (
                                user.logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={styles.activityLogCard}
                                    >
                                        <div
                                            className={
                                                styles.activityLogCardInfo
                                            }
                                        >
                                            <div
                                                className={
                                                    styles.activityLogCardTitle
                                                }
                                            >
                                                {formatString(
                                                    `${log.action} ${log.entity}`,
                                                    "CardContent",
                                                )}
                                            </div>
                                            <div
                                                className={
                                                    styles.activityLogCardDate
                                                }
                                            >
                                                {log.created_at
                                                    ? formatDateTime(
                                                          log.created_at,
                                                      )
                                                    : "N/A"}
                                            </div>
                                        </div>
                                        <div
                                            className={
                                                styles.activityLogCardBadge
                                            }
                                        >
                                            <span
                                                className={`${styles.activityLogBadge} ${log.level === "error" ? styles.activityLogBadgeError : log.level === "warning" ? styles.activityLogBadgeWarning : styles.activityLogBadgeInfo}`}
                                            >
                                                {formatString(
                                                    log.level || "info",
                                                    "CardContent",
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptySection}>
                                    No activity logs
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <ConfirmModal
                isOpen={userStatusAction !== null}
                onClose={() => setUserStatusAction(null)}
                onConfirm={handleUserStatusConfirm}
                confirmText={
                    userStatusAction === "suspend"
                        ? "Suspend User"
                        : "Unsuspend User"
                }
                title={
                    userStatusAction === "suspend"
                        ? "Suspend User?"
                        : "Unsuspend User?"
                }
                message={
                    userStatusAction === "suspend"
                        ? "This will prevent the user from accessing their account until they are unsuspended."
                        : "This will restore the user's account access."
                }
                colorType={userStatusAction === "suspend" ? "red" : "green"}
                disabled={isSuspendingUser || isUnsuspendingUser}
            />
        </Layout>
    );
};
