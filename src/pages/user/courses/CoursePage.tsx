import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useLazyGetEnrolledCourseQuery } from "../../../services/apis/user/CourseAPIs";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import useAuthQuery from "../../../hooks/useAuthQuery";
import type { DefaultAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetIcon } from "../../../utils/LinkHandler";
import IconComponent from "../../../components/IconComponent";
import styles from "./CoursePage.module.css";
import { Button } from "../../../components/forms/Button";

export const CoursePage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<SubjectResponseDto | null>(null);

    const [getEnrolledCourse] = useLazyGetEnrolledCourseQuery();

    const fetchCourse = useCallback(async () => {
        if (!courseId) return;

        try {
            const result = await getEnrolledCourse({
                course_id: parseInt(courseId),
            }).unwrap();
            setCourse(result.data || null);
        } catch (error) {
            const err = error as DefaultAPIResponse;
            navigate("/user/courses", {
                state: { error: err.data.message || "Failed to fetch course" },
            });
        }
    }, [getEnrolledCourse, navigate, courseId]);

    const authQueryParams = useCallback(() => fetchCourse(), [fetchCourse]);

    useAuthQuery(authQueryParams);

    if (!course) {
        return null;
    }

    return (
        <Layout>
            <PageSeo
                title={`${course.name} - Course Details - CU Portal`}
                description={`View course information for ${course.name}`}
            />

            <SubBanner
                title={course.name || "Course Details"}
                icon={GetIcon("course")}
                linkText="Back to Courses"
                linkTo="/user/courses"
            />

            <div className={styles.container}>
                <div className={styles.statsRow}>
                    <StatCard
                        type="Course Code"
                        value={course.code || "N/A"}
                        icon="book"
                    />
                    <StatCard
                        type="Credits"
                        value={course.credits || "N/A"}
                        icon="check"
                    />
                </div>

                <div className={styles.quickLinksSection}>
                    <h3 className={styles.quickLinksTitle}>
                        Course Quick Links
                    </h3>
                    <p className={styles.quickLinksDescription}>
                        Explore everything you need for this course
                    </p>

                    <div className={styles.quickLinksGrid}>
                        <div className={styles.quickCard}>
                            <IconComponent
                                icon="task"
                                className={styles.quickCardIcon}
                            />
                            <h5 className={styles.quickCardTitle}>Tasks</h5>
                            <p className={styles.quickCardDescription}>
                                Check all current assignments for this course.
                            </p>
                            <Button
                                text="View Tasks"
                                loadingText="Viewing Tasks..."
                                onClick={() =>
                                    navigate(
                                        "/user/tasks?subject_id=" + course.id,
                                    )
                                }
                                type="button"
                                isSubmitting={false}
                                isOrange={false}
                            />
                        </div>

                        <div className={styles.quickCard}>
                            <IconComponent
                                icon="sidebar-exams"
                                className={styles.quickCardIcon}
                            />
                            <h5 className={styles.quickCardTitle}>Exams</h5>
                            <p className={styles.quickCardDescription}>
                                Check all current exams for this course.
                            </p>
                            <Button
                                text="View Exams"
                                loadingText="Viewing Exams..."
                                onClick={() =>
                                    navigate(
                                        "/user/exams?subject_id=" + course.id,
                                    )
                                }
                                type="button"
                                isSubmitting={false}
                                isOrange={false}
                            />
                        </div>

                        <div className={styles.quickCard}>
                            <IconComponent
                                icon="announcements"
                                className={styles.quickCardIcon}
                            />
                            <h5 className={styles.quickCardTitle}>
                                Announcements
                            </h5>
                            <p className={styles.quickCardDescription}>
                                Stay updated with the latest course
                                announcements.
                            </p>
                            <Button
                                text="View Announcements"
                                loadingText="Viewing Announcements..."
                                onClick={() =>
                                    navigate(
                                        "/user/announcements?subject_id=" +
                                            course.id,
                                    )
                                }
                                type="button"
                                isSubmitting={false}
                                isOrange={false}
                            />
                        </div>

                        <div className={styles.quickCard}>
                            <IconComponent
                                icon="subject"
                                className={styles.quickCardIcon}
                            />
                            <h5 className={styles.quickCardTitle}>Materials</h5>
                            <p className={styles.quickCardDescription}>
                                Access lecture notes, PDFs, and other course
                                files.
                            </p>
                            <Button
                                text="View Materials"
                                loadingText="Viewing Materials..."
                                onClick={() =>
                                    navigate(
                                        "/user/materials?subject_id=" +
                                            course.id,
                                    )
                                }
                                type="button"
                                isSubmitting={false}
                                isOrange={false}
                            />
                        </div>

                        <div className={styles.quickCard}>
                            <IconComponent
                                icon="sidebar-grades"
                                className={styles.quickCardIcon}
                            />
                            <h5 className={styles.quickCardTitle}>Grades</h5>
                            <p className={styles.quickCardDescription}>
                                Check all grades in one place. Stay in the Top.
                            </p>
                            <Button
                                text="View Grades"
                                loadingText="Viewing Grades..."
                                onClick={() =>
                                    navigate(
                                        "/user/grades?course_id=" + course.id,
                                    )
                                }
                                type="button"
                                isSubmitting={false}
                                isOrange={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
