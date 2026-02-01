import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useLazyGetCourseQuery } from "../../../services/apis/admin/CourseAPIs";
import type { Subject } from "../../../types/entities/Subject";
import type { User } from "../../../types/entities/User";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { Bordered } from "../../../components/bordered/Bordered";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { Heading } from "../../../components/heading/Heading";

import { GetAvatarLink, GetIcon } from "../../../utils/LinkHandler";

import styles from "./CoursePage.module.css";

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
                icon={GetIcon("course")}
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
                        <div className={styles.statsRow}>
                            <StatCard
                                type="Enrolled"
                                value={enrolledCount}
                                icon="people"
                            />
                            <StatCard
                                type="Credits"
                                value={course.credits || "N/A"}
                                icon="check"
                            />
                        </div>

                        <Bordered>
                            <Heading
                                icon="info-circle"
                                content="Course Information"
                                size="large"
                            />
                            <ul className={styles.infoList}>
                                <li>
                                    <i className="fas fa-university"></i>
                                    <div>
                                        <span className={styles.infoLabel}>
                                            Faculty
                                        </span>
                                        <span className={styles.infoValue}>
                                            {course.faculty?.name || "N/A"}
                                        </span>
                                    </div>
                                </li>
                                <li>
                                    <i className="fas fa-building"></i>
                                    <div>
                                        <span className={styles.infoLabel}>
                                            Department
                                        </span>
                                        <span className={styles.infoValue}>
                                            {course.department?.name || "N/A"}
                                        </span>
                                    </div>
                                </li>
                                <li>
                                    <i className="fas fa-calendar-alt"></i>
                                    <div>
                                        <span className={styles.infoLabel}>
                                            Academic Year
                                        </span>
                                        <span className={styles.infoValue}>
                                            {course.year?.year?.toString() ||
                                                "N/A"}
                                        </span>
                                    </div>
                                </li>
                                <li>
                                    <i className="fas fa-code"></i>
                                    <div>
                                        <span className={styles.infoLabel}>
                                            Course Code
                                        </span>
                                        <span className={styles.infoValue}>
                                            {course.code}
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </Bordered>
                    </>
                )}

                {activeTab === "students" && (
                    <Bordered>
                        <div className={styles.studentsCardHeader}>
                            <Heading
                                icon="users"
                                content="Enrolled Students"
                                size="large"
                            />
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
                    </Bordered>
                )}
            </div>
        </Layout>
    );
};
