import { useState, useCallback } from "react";
import { useParams } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { Button } from "../../../components/forms/Button";
import {
    useLazyGetUserQuery,
    useUpdateUsersMutation,
} from "../../../services/apis/admin/UserAPIs";
import { useLazyGetRolesQuery } from "../../../services/apis/admin/RoleAPIs";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { UserResponseDto } from "../../../types/dtos/UserDTOs";
import type { Role } from "../../../types/entities/Role";
import userDetailsIcon from "../../../assets/icons/user-details.png";
import mailDetailsIcon from "../../../assets/icons/mail-details.png";
import callDetailsIcon from "../../../assets/icons/call-details.png";
import buildingFacultyIcon from "../../../assets/icons/building-faculty.png";
import buildingDepartmentIcon from "../../../assets/icons/building-department.png";
import certificateYearIcon from "../../../assets/icons/certificate-year.png";
import idCardDetailsIcon from "../../../assets/icons/id-card-details.png";
import examIconCircle from "../../../assets/icons/exam-icon.png";
import taskIconCircle from "../../../assets/icons/task-details-icon.png";
import announcementIconCircle from "../../../assets/icons/announcement-icon.png";
import materialsIconCircle from "../../../assets/icons/materials-icon.png";
import gradesIconCircle from "../../../assets/icons/grades-icon.png";
import subjectsIconCircle from "../../../assets/icons/subjects-icon.png";
import activityLogsIconCircle from "../../../assets/icons/activity-logs-icon.png";
import styles from "./UserPage.module.css";
import z from "zod";
import { Form } from "../../../components/forms/Form";
import { Select } from "../../../components/forms/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Avatar } from "../../../components/avatar/Avatar";
import { formatDateTime, formatTimeAgo } from "../../../utils/Formatter";

export const UserPage = () => {
    const { userId } = useParams<{ userId: string }>();
    const [isEditingRole, setIsEditingRole] = useState(false);
    const [user, setUser] = useState<UserResponseDto>({});
    const [roles, setRoles] = useState<Role[]>([]);

    const [getUser] = useLazyGetUserQuery();
    const [getRoles] = useLazyGetRolesQuery();
    const [updateUser] = useUpdateUsersMutation();

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
            setUser(result.data || {});
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [userId, getUser]);

    const fetchRoles = useCallback(async () => {
        try {
            const result = await getRoles({}).unwrap();
            setRoles(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getRoles]);

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

    return (
        <Layout>
            <PageSeo
                title={`${user.name || "User"} - CU Portal`}
                description="View and manage user details"
            />

            <Banner
                title="Users Management"
                description="Search, Filter, Approve, And Update Users All In One Place"
            />

            <div className={styles.userDetailsCard}>
                <div className={styles.userDetailsCardHeader}>
                    <div className={styles.userRoleContainer}>
                        {!isEditingRole ? (
                            <>
                                <div className={styles.userRoleLeft}>
                                    <span className={styles.userBadge}>
                                        {user.role?.name || "User"}
                                    </span>
                                    {user.is_early_access && (
                                        <span
                                            className={
                                                styles.userEarlyAccessBadge
                                            }
                                        >
                                            Early Access Member
                                        </span>
                                    )}
                                </div>
                                <button
                                    className={styles.editRoleBtn}
                                    onClick={handleEditRole}
                                >
                                    Edit Role
                                </button>
                            </>
                        ) : (
                            <Form
                                onSubmit={handleSubmit(onSubmit)}
                                errors={errors}
                                className={styles.roleForm}
                                containerClassName={styles.roleFormContainer}
                            >
                                <Select
                                    register={register}
                                    name="roleId"
                                    errors={errors}
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option value={role.id}>
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
                        <Avatar user={user} size="large" />
                    </div>
                    <div className={styles.userDetailsInfoTableWrapper}>
                        <table className={styles.userDetailsInfoTable}>
                            <tbody>
                                <tr>
                                    <td className={styles.userDetailsLabel}>
                                        <img src={userDetailsIcon} alt="User" />{" "}
                                        Name:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {user.name || "N/A"}
                                    </td>
                                    <td className={styles.userDetailsLabel}>
                                        <img src={mailDetailsIcon} alt="Mail" />{" "}
                                        E-Mail:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {user.email || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.userDetailsLabel}>
                                        <img
                                            src={callDetailsIcon}
                                            alt="Phone"
                                        />{" "}
                                        Phone:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {user.phone || "N/A"}
                                    </td>
                                    <td className={styles.userDetailsLabel}>
                                        <img
                                            src={buildingFacultyIcon}
                                            alt="Faculty"
                                        />{" "}
                                        Faculty:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {user.faculty?.name || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.userDetailsLabel}>
                                        <img
                                            src={buildingDepartmentIcon}
                                            alt="Department"
                                        />{" "}
                                        Department:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {user.department?.name || "N/A"}
                                    </td>
                                    <td className={styles.userDetailsLabel}>
                                        <img
                                            src={certificateYearIcon}
                                            alt="Year"
                                        />{" "}
                                        Academic Year:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {user.year?.year || "N/A"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.userDetailsLabel}>
                                        <img
                                            src={idCardDetailsIcon}
                                            alt="National ID"
                                        />
                                        National ID:
                                    </td>
                                    <td className={styles.userDetailsValue}>
                                        {user.national_id || "N/A"}
                                    </td>
                                    <td></td>
                                    <td></td>
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
                                <img src={examIconCircle} alt="Exams" />
                            </span>
                            <span className={styles.examsHeaderTitle}>
                                Exams
                            </span>
                        </div>
                        {user.exams_published &&
                            user.exams_published.length > 0 && (
                                <div className={styles.examsListPublished}>
                                    {user.exams_published.map((exam) => {
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
                                                    className={
                                                        styles.examCardIcon
                                                    }
                                                >
                                                    <img
                                                        src={examIconCircle}
                                                        alt="Exam"
                                                        className={
                                                            styles.examCircleIcon
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    className={
                                                        styles.examCardInfo
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.examCardTitle
                                                        }
                                                    >
                                                        {exam.name}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.examCardSubject
                                                        }
                                                    >
                                                        {exam.subject?.name ||
                                                            "N/A"}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.examCardDate
                                                        }
                                                    >
                                                        Due:{" "}
                                                        {exam.due_date
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
                                    })}
                                </div>
                            )}
                        <div className={styles.examsListGray}>
                            {user.exams && user.exams.length > 0 ? (
                                user.exams.map((exam) => {
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
                                            className={styles.examCard}
                                        >
                                            <div
                                                className={styles.examCardIcon}
                                            >
                                                <img
                                                    src={examIconCircle}
                                                    alt="Exam"
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
                                                    {exam.name}
                                                </div>
                                                <div
                                                    className={
                                                        styles.examCardSubject
                                                    }
                                                >
                                                    {exam.subject?.name ||
                                                        "N/A"}
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
                                    No exams
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.tasksSection}>
                        <div className={styles.tasksHeader}>
                            <img
                                src={taskIconCircle}
                                alt="Tasks"
                                className={styles.tasksHeaderIcon}
                            />
                            <span className={styles.tasksHeaderTitle}>
                                Tasks
                            </span>
                        </div>
                        {user.tasks_published &&
                            user.tasks_published.length > 0 && (
                                <div className={styles.tasksListPublished}>
                                    {user.tasks_published.map((task) => {
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
                                                    className={
                                                        styles.taskCardIcon
                                                    }
                                                >
                                                    <img
                                                        src={taskIconCircle}
                                                        alt="Task"
                                                        className={
                                                            styles.taskCircleIcon
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    className={
                                                        styles.taskCardInfo
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.taskCardTitle
                                                        }
                                                    >
                                                        {task.name}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.taskCardSubject
                                                        }
                                                    >
                                                        {task.subject?.name ||
                                                            "N/A"}
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
                                    })}
                                </div>
                            )}
                        <div className={styles.tasksListGray}>
                            {user.tasks && user.tasks.length > 0 ? (
                                user.tasks.map((task) => {
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
                                            className={styles.taskCard}
                                        >
                                            <div
                                                className={styles.taskCardIcon}
                                            >
                                                <img
                                                    src={taskIconCircle}
                                                    alt="Task"
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
                                                    {task.name}
                                                </div>
                                                <div
                                                    className={
                                                        styles.taskCardSubject
                                                    }
                                                >
                                                    {task.subject?.name ||
                                                        "N/A"}
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
                                    No tasks
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
                            <img
                                src={announcementIconCircle}
                                alt="Announcement"
                                className={styles.announcementHeaderIcon}
                            />
                            <span className={styles.announcementHeaderTitle}>
                                Announcement
                            </span>
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
                                                        {announcement.title}
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
                                                    {announcement.content ||
                                                        "No content"}
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
                                    No announcements
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.materialsSection}>
                        <div className={styles.materialsHeader}>
                            <img
                                src={materialsIconCircle}
                                alt="Materials"
                                className={styles.materialsHeaderIcon}
                            />
                            <span className={styles.materialsHeaderTitle}>
                                Materials
                            </span>
                        </div>
                        <div className={styles.materialsList}>
                            {user.materials_uploaded &&
                            user.materials_uploaded.length > 0 ? (
                                user.materials_uploaded.map((material) => (
                                    <div
                                        key={material.id}
                                        className={styles.materialsCard}
                                    >
                                        <div
                                            className={styles.materialsCardIcon}
                                        >
                                            <img
                                                src={materialsIconCircle}
                                                alt="Material"
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
                                                {material.name}
                                            </div>
                                            <div
                                                className={
                                                    styles.materialsCardSubject
                                                }
                                            >
                                                {material.subject?.name ||
                                                    "N/A"}
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
            </div>

            <div className={styles.sectionsRow}>
                <section className={styles.section}>
                    <div className={styles.gradesSection}>
                        <div className={styles.gradesHeader}>
                            <img
                                src={gradesIconCircle}
                                alt="Grades"
                                className={styles.gradesHeaderIcon}
                            />
                            <span className={styles.gradesHeaderTitle}>
                                Grades
                            </span>
                        </div>
                        <div className={styles.gradesList}>
                            {user.grades_uploaded &&
                            user.grades_uploaded.length > 0 ? (
                                user.grades_uploaded.map((grade) => (
                                    <div
                                        key={grade.id}
                                        className={styles.gradesCard}
                                    >
                                        <div className={styles.gradesCardIcon}>
                                            <img
                                                src={gradesIconCircle}
                                                alt="Grade"
                                                className={
                                                    styles.gradesCircleIcon
                                                }
                                            />
                                        </div>
                                        <div className={styles.gradesCardInfo}>
                                            <div
                                                className={
                                                    styles.gradesCardTitle
                                                }
                                            >
                                                {grade.name}
                                            </div>
                                            <div
                                                className={
                                                    styles.gradesCardSubject
                                                }
                                            >
                                                {grade.subject?.name || "N/A"}
                                            </div>
                                            <div
                                                className={
                                                    styles.gradesCardDateRow
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.gradesCardDate
                                                    }
                                                >
                                                    Uploaded{" "}
                                                    {grade.created_at
                                                        ? formatTimeAgo(
                                                              grade.created_at,
                                                          )
                                                        : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className={styles.gradesCardBadges}
                                        >
                                            <span
                                                className={`${styles.gradesBadge} ${styles.gradesBadgePublisher}`}
                                            >
                                                Publisher
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptySection}>
                                    No grades uploaded
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.subjectsSection}>
                        <div className={styles.subjectsHeader}>
                            <img
                                src={subjectsIconCircle}
                                alt="Subjects"
                                className={styles.subjectsHeaderIcon}
                            />
                            <span className={styles.subjectsHeaderTitle}>
                                Subjects
                            </span>
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
                                            <img
                                                src={subjectsIconCircle}
                                                alt="Subject"
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
                                                {subject.name}
                                            </div>
                                            <div
                                                className={
                                                    styles.subjectsCardCode
                                                }
                                            >
                                                {subject.code || "N/A"}
                                            </div>
                                            <div
                                                className={
                                                    styles.subjectsCardCredit
                                                }
                                            >
                                                {`${subject.credits} Credit Hours`}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptySection}>
                                    No subjects
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            <section className={styles.activityLogsFullWidth}>
                <div className={styles.activityLogsSection}>
                    <div className={styles.activityLogsHeader}>
                        <img
                            src={activityLogsIconCircle}
                            alt="Activity Logs"
                            className={styles.activityLogsHeaderIcon}
                        />
                        <span className={styles.activityLogsHeaderTitle}>
                            Activity Logs
                        </span>
                    </div>
                    <div className={styles.activityLogsList}>
                        {user.logs && user.logs.length > 0 ? (
                            user.logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={styles.activityLogCard}
                                >
                                    <div className={styles.activityLogCardInfo}>
                                        <div
                                            className={
                                                styles.activityLogCardTitle
                                            }
                                        >
                                            {`${log.action} ${log.entity}`}
                                        </div>
                                        <div
                                            className={
                                                styles.activityLogCardDate
                                            }
                                        >
                                            {log.created_at
                                                ? formatDateTime(log.created_at)
                                                : "N/A"}
                                        </div>
                                    </div>
                                    <div
                                        className={styles.activityLogCardBadge}
                                    >
                                        <span
                                            className={`${styles.activityLogBadge} ${log.level === "error" ? styles.activityLogBadgeError : log.level === "warning" ? styles.activityLogBadgeWarning : styles.activityLogBadgeInfo}`}
                                        >
                                            {log.level || "info"}
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
        </Layout>
    );
};
