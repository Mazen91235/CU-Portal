import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useLazyGetCourseQuery } from "../../../services/apis/admin/CourseAPIs";
import type { Subject } from "../../../types/entities/Subject";
import type { User } from "../../../types/entities/User";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import styles from "./CoursePage.module.css";
import { SubBanner } from "../../../components/banner/SubBanner";
import courseIcon from "../../../assets/icons/course-icon.svg";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { GetAvatarLink } from "../../../utils/LinkHandler";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";

export const CoursePage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Subject | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "students">(
        "overview",
    );

    const [getCourse] = useLazyGetCourseQuery();

    const fetchCourse = useCallback(async () => {
        if (!courseId) return;

        try {
            const result = await getCourse({
                course_id: parseInt(courseId),
            }).unwrap();
            setCourse(result.data || null);
        } catch (error) {
            const err = error as DefaultAPIResponse;
            navigate("/admin/courses", {
                state: { error: err.data.message || "Failed to fetch course" },
            });
        }
    }, [getCourse, navigate, courseId]);

    const authQueryParams = useCallback(() => fetchCourse(), [fetchCourse]);

    useAuthQuery(authQueryParams);

    if (!course) {
        return null;
    }

    const students = course.users || [];
    const enrolledCount = course.users_count || 0;

    return (
        <Layout>
            <PageSeo
                title={`${course.name} - Course Details - CU Portal`}
                description={`View and manage course information for ${course.name}`}
            />

            <SubBanner
                title={course.name || "Course Details"}
                icon={courseIcon}
                button="Edit Course"
                buttonAction={() =>
                    navigate(`/admin/courses/edit/${course.id}`)
                }
                linkText="Back to Courses"
                linkTo="/admin/courses"
            />

            <div className={styles.container}>
                <div className={styles.courseTabsRow}>
                    <button
                        className={`${styles.courseTabBtn} ${activeTab === "overview" ? styles.active : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </button>
                    <button
                        className={`${styles.courseTabBtn} ${activeTab === "students" ? styles.active : ""}`}
                        onClick={() => setActiveTab("students")}
                    >
                        Students ({enrolledCount})
                    </button>
                </div>

                {activeTab === "overview" && (
                    <>
                        <div className={styles.courseStatsRow}>
                            <div className={styles.courseStatCard}>
                                <div
                                    className={styles.courseStatImgbox}
                                    style={{
                                        backgroundColor:
                                            "rgba(37, 99, 235, 0.10)",
                                    }}
                                >
                                    <i
                                        className="fas fa-users"
                                        style={{ color: "#2563eb" }}
                                    ></i>
                                </div>
                                <div className={styles.courseStatTexts}>
                                    <div className={styles.courseStatTitle}>
                                        Enrolled
                                    </div>
                                    <div className={styles.courseStatValue}>
                                        {enrolledCount}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.courseStatCard}>
                                <div
                                    className={styles.courseStatImgbox}
                                    style={{
                                        backgroundColor:
                                            "rgba(22, 163, 74, .1)",
                                    }}
                                >
                                    <i
                                        className="fas fa-user-check"
                                        style={{ color: "#16a34a" }}
                                    ></i>
                                </div>
                                <div className={styles.courseStatTexts}>
                                    <div className={styles.courseStatTitle}>
                                        Credits
                                    </div>
                                    <div className={styles.courseStatValue}>
                                        {course.credits || "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.courseInfoRow}>
                            <div className={styles.courseInfoCard}>
                                <h4>Course Information</h4>
                                <ul className={styles.courseInfoList}>
                                    <li>
                                        <i className="fas fa-university"></i>
                                        <div>
                                            <span className={styles.ciLabel}>
                                                Faculty
                                            </span>
                                            <span className={styles.ciValue}>
                                                {course.faculty?.name || "N/A"}
                                            </span>
                                        </div>
                                    </li>
                                    <li>
                                        <i className="fas fa-building"></i>
                                        <div>
                                            <span className={styles.ciLabel}>
                                                Department
                                            </span>
                                            <span className={styles.ciValue}>
                                                {course.department?.name ||
                                                    "N/A"}
                                            </span>
                                        </div>
                                    </li>
                                    <li>
                                        <i className="fas fa-calendar-alt"></i>
                                        <div>
                                            <span className={styles.ciLabel}>
                                                Academic Year
                                            </span>
                                            <span className={styles.ciValue}>
                                                {course.year?.year?.toString() ||
                                                    "N/A"}
                                            </span>
                                        </div>
                                    </li>
                                    <li>
                                        <i className="fas fa-code"></i>
                                        <div>
                                            <span className={styles.ciLabel}>
                                                Course Code
                                            </span>
                                            <span className={styles.ciValue}>
                                                {course.code}
                                            </span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === "students" && (
                    <div className={styles.studentsCard}>
                        <div className={styles.studentsCardHeader}>
                            <div className={styles.studentsCardTitle}>
                                Enrolled Students
                            </div>
                            <div className={styles.studentsCardCount}>
                                {enrolledCount} Students
                            </div>
                        </div>
                        <ul className={styles.studentsList}>
                            {students.map((student: User) => (
                                <li
                                    key={student.id}
                                    className={styles.studentListItem}
                                >
                                    <img
                                        src={GetAvatarLink(
                                            student.details?.avatar ||
                                                student?.google_avatar ||
                                                "",
                                        )}
                                        alt={student.name || "Unknown User"}
                                        className={styles.studentInitialsIcon}
                                    />
                                    <div className={styles.studentInfo}>
                                        <div className={styles.studentName}>
                                            {student.name || "Unknown User"}
                                        </div>
                                        <div className={styles.studentEmail}>
                                            {student.email}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {students.length === 0 && (
                                <li className={styles.emptyState}>
                                    No students enrolled yet
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </Layout>
    );
};
