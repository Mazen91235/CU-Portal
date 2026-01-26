import { useState } from "react";
import { PageSeo } from "../../../components/PageSeo";
import { Search } from "../../../components/forms/Search";
import { Card } from "../../../components/card/Card";
import styles from "./RegisteredCourses.module.css";

type Course = {
    id: string;
    code: string;
    name: string;
    credits: string;
    faculty: string;
    department: string;
    year: string;
};

export const RegisteredCourses = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [registeredCourses] = useState<Course[]>([
        {
            id: "1",
            code: "CS201",
            name: "Operating Systems",
            credits: "3 Credits",
            faculty: "Computer Science",
            department: "CS Department",
            year: "2024",
        },
    ]);

    const [availableCourses] = useState<Course[]>([
        {
            id: "2",
            code: "CS205",
            name: "Data Structures & Algorithms",
            credits: "4 Credits",
            faculty: "Computer Science",
            department: "CS Department",
            year: "2024",
        },
    ]);

    const filteredAvailableCourses = availableCourses.filter(
        (course) =>
            course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <>
            <PageSeo
                title="Courses Settings"
                description="Manage your registered and available courses"
            />
            <div className={styles.container}>
                <div className={styles.mainCard}>
                    <h3 className={styles.pageTitle}>Courses Settings</h3>
                    <div className={styles.underline} />

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <img
                                src="/assets/hat.png"
                                alt="Hat Icon"
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
                                    secondaryBadge={course.credits}
                                    items={[
                                        {
                                            icon: "subject",
                                            label: "Faculty",
                                            value: course.faculty,
                                            color: "pink",
                                        },
                                        {
                                            icon: "location",
                                            label: "Department",
                                            value: course.department,
                                            color: "yellow",
                                        },
                                        {
                                            icon: "calendar",
                                            label: "Year",
                                            value: course.year,
                                            color: "green",
                                        },
                                    ]}
                                    button="View Course"
                                    buttonAction={() =>
                                        console.log("View", course.id)
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <img
                                src="/assets/hat.png"
                                alt="Hat Icon"
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className={styles.cardsGrid}>
                            {filteredAvailableCourses.map((course) => (
                                <Card
                                    key={course.id}
                                    title={course.name}
                                    badge={course.code}
                                    secondaryBadge={course.credits}
                                    items={[
                                        {
                                            icon: "subject",
                                            label: "Faculty",
                                            value: course.faculty,
                                            color: "pink",
                                        },
                                        {
                                            icon: "location",
                                            label: "Department",
                                            value: course.department,
                                            color: "yellow",
                                        },
                                        {
                                            icon: "calendar",
                                            label: "Year",
                                            value: course.year,
                                            color: "green",
                                        },
                                    ]}
                                    button="Register Course"
                                    buttonAction={() =>
                                        console.log("Register", course.id)
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
