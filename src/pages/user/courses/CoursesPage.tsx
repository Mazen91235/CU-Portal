import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Card } from "../../../components/card/Card";
import {
    useLazyGetAvailableCoursesQuery,
    useLazyGetEnrolledCoursesQuery,
} from "../../../services/apis/user/CourseAPIs";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import IconComponent from "../../../components/IconComponent";

import styles from "./CoursesPage.module.css";

const searchQuery = "";

export const CoursesPage = () => {
    const navigate = useNavigate();
        const [getEnrolledCourses] = useLazyGetEnrolledCoursesQuery();
    const [getAvailableCourses] = useLazyGetAvailableCoursesQuery();
    const [registeredCourses, setRegisteredCourses] = useState<
        SubjectResponseDto[]
    >([]);
    const [availableCourses, setAvailableCourses] = useState<
        SubjectResponseDto[]
    >([]);

    const fetchData = useCallback(async () => {
        await Promise.all([
            getEnrolledCourses()
                .unwrap()
                .then((response) => {
                    setRegisteredCourses(response.data || []);
                }),
            getAvailableCourses()
                .unwrap()
                .then((response) => {
                    setAvailableCourses(response.data || []);
                }),
        ]);
    }, [getEnrolledCourses, getAvailableCourses]);

    useAuthQuery(fetchData);

    const filteredAvailableCourses = useMemo(() => {
        return availableCourses.filter((course) => {
            return (
                course.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                course.code?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    }, [availableCourses, searchQuery]);

    const handleViewCourse = (courseId: number) => {
        navigate(`/user/courses/${courseId}`);
    };

    return (
        <Layout>
            <PageSeo
                title="My Courses - CU Portal"
                description="View your registered and available courses"
            />
            <Banner
                title="My Courses"
                description="View your registered and available courses"
            />
            <div className={styles.container}>
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <IconComponent icon="hat" className={styles.hatIcon} />
                        <span className={styles.sectionTitle}>
                            Registered Courses
                        </span>
                        <span className={styles.courseBadge}>
                            {registeredCourses.length} Courses
                        </span>
                    </div>

                    <div className={styles.cardsGrid}>
                        {registeredCourses.map((course) => (
                            <Card
                                key={course.id}
                                title={course.name || undefined}
                                badge={course.code || undefined}
                                secondaryBadge={`${course.credits} Credits`}
                                items={[
                                    {
                                        icon: "subject",
                                        label: "Faculty",
                                        value: course.faculty?.name || undefined,
                                        color: "pink",
                                    },
                                    {
                                        icon: "location",
                                        label: "Department",
                                        value: course.department?.name || undefined,
                                        color: "yellow",
                                    },
                                    {
                                        icon: "calendar",
                                        label: "Year",
                                        value: course.year?.year?.toString() || undefined,
                                        color: "green",
                                    },
                                ]}
                                button="View Course"
                                buttonAction={() =>
                                    handleViewCourse(course.id!)
                                }
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <IconComponent icon="hat" className={styles.hatIcon} />
                        <span className={styles.sectionTitle}>
                            Available Courses
                        </span>
                        <span className={styles.courseBadge}>
                            {filteredAvailableCourses.length} Courses
                        </span>
                    </div>

                    <div className={styles.cardsGrid}>
                        {filteredAvailableCourses.map((course) => (
                            <Card
                                key={course.id}
                                title={course.name || undefined}
                                badge={course.code || undefined}
                                secondaryBadge={`${course.credits?.toString()} Credits`}
                                items={[
                                    {
                                        icon: "subject",
                                        label: "Faculty",
                                        value: course.faculty?.name || undefined,
                                        color: "pink",
                                    },
                                    {
                                        icon: "location",
                                        label: "Department",
                                        value: course.department?.name || undefined,
                                        color: "yellow",
                                    },
                                    {
                                        icon: "calendar",
                                        label: "Year",
                                        value: course.year?.year?.toString() || undefined,
                                        color: "green",
                                    },
                                ]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
