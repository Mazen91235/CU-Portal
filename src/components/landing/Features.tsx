import coursesIcon from "../../assets/icons/iconsax-book-saved.png";
import trackerIcon from "../../assets/icons/tracker.png";
import roadmapsIcon from "../../assets/icons/target.png";
import discussionIcon from "../../assets/icons/chat.png";
import eventsIcon from "../../assets/icons/events.png";
import announcementsIcon from "../../assets/icons/announcements.png";
import styles from "./Features.module.css";

const features = [
    {
        icon: coursesIcon,
        title: "Enrolled Courses",
        description:
            "Access course materials, syllabi, grades, and schedules for all your enrolled courses in one dedicated dashboard.",
    },
    {
        icon: trackerIcon,
        title: "Study Tracker",
        description:
            "Monitor your study hours, set goals, and visualize your progress across all your courses.",
    },
    {
        icon: roadmapsIcon,
        title: "Roadmaps",
        description:
            "Plan your entire academic journey, explore career paths, and visualize your required courses step-by-step.",
    },
    {
        icon: discussionIcon,
        title: "Discussion",
        description:
            "Connect with classmates, ask questions, share insights, and form study groups in a supportive environment.",
    },
    {
        icon: eventsIcon,
        title: "Events",
        description:
            "Explore campus events, workshops, guest lectures, and social gatherings. Enhance your university experience.",
    },
    {
        icon: announcementsIcon,
        title: "Announcements",
        description:
            "Stay informed with real-time announcements from your university, departments, and course instructors.",
    },
];

export const Features = () => {
    return (
        <section className={styles.features} id="features">
            <div className={styles.toolkitCard}>
                <h2 className={styles.toolkitTitle}>
                    Your Toolkit for{" "}
                    <span className={styles.gradientText}>
                        A Smarter Semester
                    </span>
                </h2>
                <div className={styles.miniFeaturesGrid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.miniFeaturePair}>
                            <div className={styles.featureIconCircle}>
                                <span className={styles.featureIconBg}>
                                    <img
                                        src={feature.icon}
                                        alt={feature.title}
                                    />
                                </span>
                            </div>
                            <div className={styles.miniFeatureCard}>
                                <h3 className={styles.miniCardTitle}>
                                    {feature.title}
                                </h3>
                                <p className={styles.miniCardText}>
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
