import { useCallback, useMemo, useState } from "react";
import { PageSeo } from "../../../components/PageSeo";
import { Search } from "../../../components/forms/Search";
import { Card } from "../../../components/card/Card";
import {
    useLazyGetAvailableCoursesQuery,
    useLazyGetEnrolledCoursesQuery,
    useRegisterCourseMutation,
    useUnregisterCourseMutation,
} from "../../../services/apis/user/CourseAPIs";
import type { Subject } from "../../../types/entities/Subject";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { Layout } from "../../../components/layout/Layout";

import IconComponent from "../../../components/IconComponent";

import styles from "./RegisteredCourses.module.css";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { showToast } from "../../../utils/ToastsManager";

export const RegisteredCourses = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [getEnrolledCourses] = useLazyGetEnrolledCoursesQuery();
    const [getAvailableCourses] = useLazyGetAvailableCoursesQuery();
    const [registerCourse] = useRegisterCourseMutation();
    const [unRegisterCourse] = useUnregisterCourseMutation();
    const [registeredCourses, setRegisteredCourses] = useState<Subject[]>([]);
    const [availableCourses, setAvailableCourses] = useState<Subject[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Subject | null>(null);
    const [action, setAction] = useState<"register" | "unregister" | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fetchData = useCallback(async () => {
        await Promise.all([
            getEnrolledCourses()
                .unwrap()
                .then((response) => {
                    setRegisteredCourses(response.data || []);
                }),
            getAvailableCourses({})
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

    const handleConfirm = useCallback(async () => {
        if (selectedCourse && selectedCourse.id && action === "register") {
            await registerCourse({ course_id: selectedCourse.id }).unwrap();
            showToast("success", "Success", "Course registered successfully.");
        }
        if (selectedCourse && selectedCourse.id && action === "unregister") {
            await unRegisterCourse({ course_id: selectedCourse.id }).unwrap();
            showToast(
                "success",
                "Success",
                "Course unregistered successfully.",
            );
        }
        await fetchData();
        setIsModalOpen(false);
    }, [selectedCourse, action, fetchData, registerCourse, unRegisterCourse]);

    return (
        <>
            <PageSeo
                title="Courses Settings - CU Portal"
                description="Manage your registered and available courses"
            />
            <Layout>
                <div className={styles.container}>
                    <div className={styles.mainCard}>
                        <h3 className={styles.pageTitle}>Courses Settings</h3>
                        <div className={styles.underline} />

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <IconComponent
                                    icon="hat"
                                    className={styles.hatIcon}
                                />
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
                                        title={course.name}
                                        badge={course.code}
                                        secondaryBadge={`${course.credits} Credits`}
                                        items={[
                                            {
                                                icon: "subject",
                                                label: "Faculty",
                                                value: course.faculty?.name,
                                                color: "pink",
                                            },
                                            {
                                                icon: "location",
                                                label: "Department",
                                                value: course.department?.name,
                                                color: "yellow",
                                            },
                                            {
                                                icon: "calendar",
                                                label: "Year",
                                                value: course.year?.year?.toString(),
                                                color: "green",
                                            },
                                        ]}
                                        button="Unregister Course"
                                        buttonAction={() => {
                                            setSelectedCourse(course);
                                            setAction("unregister");
                                            setIsModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <IconComponent
                                    icon="hat"
                                    className={styles.hatIcon}
                                />
                                <span className={styles.sectionTitle}>
                                    Available Courses
                                </span>
                                <span className={styles.courseBadge}>
                                    {filteredAvailableCourses.length} Courses
                                </span>
                            </div>

                            <div className={styles.searchContainer}>
                                <Search
                                    placeholder="Search by subject name, instructor, or code"
                                    setValue={setSearchQuery}
                                />
                            </div>

                            <div className={styles.cardsGrid}>
                                {filteredAvailableCourses.map((course) => (
                                    <Card
                                        key={course.id}
                                        title={course.name}
                                        badge={course.code}
                                        secondaryBadge={`${course.credits?.toString()} Credits`}
                                        items={[
                                            {
                                                icon: "subject",
                                                label: "Faculty",
                                                value: course.faculty?.name,
                                                color: "pink",
                                            },
                                            {
                                                icon: "location",
                                                label: "Department",
                                                value: course.department?.name,
                                                color: "yellow",
                                            },
                                            {
                                                icon: "calendar",
                                                label: "Year",
                                                value: course.year?.year?.toString(),
                                                color: "green",
                                            },
                                        ]}
                                        button="Register Course"
                                        buttonAction={() => {
                                            setSelectedCourse(course);
                                            setAction("register");
                                            setIsModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <ConfirmModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirm}
                    confirmText={
                        action === "register" ? "Register" : "Unregister"
                    }
                    title={
                        action === "register"
                            ? "Confirm Course Registration"
                            : "Confirm Course Unregistration"
                    }
                    message={
                        action === "register"
                            ? "Are you sure you want to register for this course?"
                            : "Are you sure you want to unregister from this course?"
                    }
                    colorType={action === "register" ? "green" : "red"}
                />
            </Layout>
        </>
    );
};
