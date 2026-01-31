import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAppSelector } from "../../services/redux/Hooks";
import { useLogoutMutation } from "../../services/apis/AuthenticateAPIs";
import dropdownIcon from "../../assets/icons/sidebar-dropdown.svg";
import homeIcon from "../../assets/icons/sidebar-home.svg";
import coursesIcon from "../../assets/icons/sidebar-courses.svg";
import courseMapIcon from "../../assets/icons/sidebar-coursemap.svg";
import calendarIcon from "../../assets/icons/sidebar-calendar.svg";
import tasksIcon from "../../assets/icons/sidebar-tasks.svg";
import examsIcon from "../../assets/icons/sidebar-exams.svg";
import announcementsIcon from "../../assets/icons/sidebar-announcements.svg";
import materialsIcon from "../../assets/icons/sidebar-materials.svg";
import otherMaterialsIcon from "../../assets/icons/sidebar-other-materials.svg";
import gradesIcon from "../../assets/icons/sidebar-grades.svg";
import studyTrackerIcon from "../../assets/icons/sidebar-study-tracker.svg";
import eventsIcon from "../../assets/icons/sidebar-events.svg";
import cvGeneratorIcon from "../../assets/icons/sidebar-cv-generator.svg";
import roadmapsIcon from "../../assets/icons/sidebar-roadmaps.svg";
import discussionIcon from "../../assets/icons/sidebar-discussion.svg";
import profileSettingsIcon from "../../assets/icons/sidebar-profile-settings.svg";
import academicSettingsIcon from "../../assets/icons/sidebar-academic-settings.svg";
import registeredCoursesIcon from "../../assets/icons/sidebar-registered-courses.svg";
import logoutIcon from "../../assets/icons/sidebar-logout.svg";
import adminDashboardIcon from "../../assets/icons/sidebar-admin-dashboard.svg";
import adminFacultiesIcon from "../../assets/icons/sidebar-admin-faculties.svg";
import adminDepartmentsIcon from "../../assets/icons/sidebar-admin-departments.svg";
import adminYearsIcon from "../../assets/icons/sidebar-admin-years.svg";
import adminCourseMapsIcon from "../../assets/icons/sidebar-admin-course-maps.svg";
import adminUsersIcon from "../../assets/icons/sidebar-admin-users.svg";
import adminRolesIcon from "../../assets/icons/sidebar-admin-roles.svg";
import adminCoursesIcon from "../../assets/icons/sidebar-admin-courses.svg";
import adminMaterialsIcon from "../../assets/icons/sidebar-admin-materials.svg";
import adminGradesIcon from "../../assets/icons/sidebar-admin-grades.svg";
import adminTasksIcon from "../../assets/icons/sidebar-admin-tasks.svg";
import adminExamsIcon from "../../assets/icons/sidebar-admin-exams.svg";
import adminAnnouncementsIcon from "../../assets/icons/sidebar-admin-announcements.svg";
import adminLogsIcon from "../../assets/icons/sidebar-admin-logs.svg";
import adminRoadmapsIcon from "../../assets/icons/sidebar-admin-roadmaps.svg";
import adminStudyMapsIcon from "../../assets/icons/sidebar-admin-study-maps.svg";
import adminStudyAnalysisIcon from "../../assets/icons/sidebar-admin-study-analysis.svg";
import adminEventsIcon from "../../assets/icons/sidebar-admin-events.svg";
import adminDiscussionsIcon from "../../assets/icons/sidebar-admin-discussions.svg";
import styles from "./Sidebar.module.css";
import { handlePopupErrors } from "../../utils/ErrorHandling";
import { GetAvatarLink } from "../../utils/LinkHandler";
import Logo from "../logo/Logo";

type BadgeType = "Soon" | "Beta" | "New" | "Early Access";

type NavLink = {
    label: string;
    path: string;
    icon: string;
    badge?: BadgeType;
    activatesPaths?: string[];
};

type NavSection = {
    title: string;
    links: NavLink[];
};

const navSectionsDefault: NavSection[] = [
    {
        title: "Academic",
        links: [
            { label: "Home", path: "/user", icon: homeIcon },
            {
                label: "Courses",
                path: "/user/courses",
                icon: coursesIcon,
            },
            {
                label: "Course Map",
                path: "/user/course-map",
                icon: courseMapIcon,
            },
            {
                label: "Calendar",
                path: "/user/calendar",
                icon: calendarIcon,
            },
            { label: "Tasks", path: "/user/tasks", icon: tasksIcon },
            { label: "Exams", path: "/user/exams", icon: examsIcon },
            {
                label: "Announcements",
                path: "/user/announcements",
                icon: announcementsIcon,
            },
            {
                label: "Materials",
                path: "/user/materials",
                icon: materialsIcon,
            },
            {
                label: "Other Materials",
                path: "/user/other-materials",
                icon: otherMaterialsIcon,
                badge: "Soon",
            },
            { label: "Grades", path: "/user/grades", icon: gradesIcon },
        ],
    },
    {
        title: "Organization",
        links: [
            {
                label: "Study Tracker",
                path: "/user/study-tracker",
                icon: studyTrackerIcon,
                badge: "Soon",
            },
            {
                label: "Events",
                path: "/user/events",
                icon: eventsIcon,
                badge: "Soon",
            },
        ],
    },
    {
        title: "Personal",
        links: [
            {
                label: "CV Generator",
                path: "/user/cv-generator",
                icon: cvGeneratorIcon,
                badge: "Soon",
            },
        ],
    },
    {
        title: "Career Development",
        links: [
            {
                label: "Roadmaps",
                path: "/user/roadmaps",
                icon: roadmapsIcon,
                badge: "Soon",
            },
        ],
    },
    {
        title: "Community",
        links: [
            {
                label: "Discussion",
                path: "/user/discussion",
                icon: discussionIcon,
                badge: "Soon",
            },
        ],
    },
    {
        title: "Settings",
        links: [
            {
                label: "Profile Settings",
                path: "/user/settings/profile",
                icon: profileSettingsIcon,
            },
            {
                label: "Academic Settings",
                path: "/user/settings/academic",
                icon: academicSettingsIcon,
            },
            {
                label: "Registered Courses",
                path: "/user/settings/courses",
                icon: registeredCoursesIcon,
            },
        ],
    },
];

const showAdminLinks = (permissions: string[]) => {
    const section: NavSection = {
        title: "Admin Pages",
        links: [],
    };

    if (!permissions.includes("View Admin Links")) return null;

    if (permissions.includes("View Admin Panel")) {
        section.links.push({
            label: "Dashboard",
            path: "/admin",
            icon: adminDashboardIcon,
            badge: "Soon",
        });
    }

    if (permissions.includes("View Faculties")) {
        section.links.push({
            label: "Faculties",
            path: "/admin/faculties",
            icon: adminFacultiesIcon,
        });
    }

    if (permissions.includes("View Departments")) {
        section.links.push({
            label: "Departments",
            path: "/admin/departments",
            icon: adminDepartmentsIcon,
        });
    }

    if (permissions.includes("View Years")) {
        section.links.push({
            label: "Years",
            path: "/admin/years",
            icon: adminYearsIcon,
        });
    }

    if (permissions.includes("View Course Maps")) {
        section.links.push({
            label: "Course Maps",
            path: "/admin/course-maps",
            icon: adminCourseMapsIcon,
        });
    }

    if (permissions.includes("View Users")) {
        section.links.push({
            label: "Users",
            path: "/admin/users",
            icon: adminUsersIcon,
            activatesPaths: ["/admin/pending-users"],
        });
    }

    if (permissions.includes("View Roles")) {
        section.links.push({
            label: "Roles",
            path: "/admin/roles",
            icon: adminRolesIcon,
        });
    }

    if (permissions.includes("View Courses")) {
        section.links.push({
            label: "Courses",
            path: "/admin/courses",
            icon: adminCoursesIcon,
            activatesPaths: ["/admin/courses/"],
        });
    }

    if (permissions.includes("View Materials")) {
        section.links.push({
            label: "Materials",
            path: "/admin/materials",
            icon: adminMaterialsIcon,
        });
    }

    if (permissions.includes("View Grades")) {
        section.links.push({
            label: "Grades",
            path: "/admin/grades",
            icon: adminGradesIcon,
        });
    }

    if (permissions.includes("View Tasks")) {
        section.links.push({
            label: "Tasks",
            path: "/admin/tasks",
            icon: adminTasksIcon,
            activatesPaths: ["/admin/tasks/"],
        });
    }

    if (permissions.includes("View Exams")) {
        section.links.push({
            label: "Exams",
            path: "/admin/exams",
            icon: adminExamsIcon,
            activatesPaths: ["/admin/exams/"],
        });
    }

    if (permissions.includes("View Announcements")) {
        section.links.push({
            label: "Announcements",
            path: "/admin/announcements",
            icon: adminAnnouncementsIcon,
            activatesPaths: ["/admin/announcements/"],
        });
    }

    if (permissions.includes("View Logs")) {
        section.links.push({
            label: "Logs",
            path: "/admin/logs",
            icon: adminLogsIcon,
        });
    }

    section.links.push({
        label: "Roadmaps",
        path: "/admin/roadmaps",
        icon: adminRoadmapsIcon,
        badge: "Soon",
    });

    section.links.push({
        label: "Study Maps",
        path: "/admin/study-maps",
        icon: adminStudyMapsIcon,
        badge: "Soon",
    });

    section.links.push({
        label: "Study Analysis",
        path: "/admin/study-analysis",
        icon: adminStudyAnalysisIcon,
        badge: "Soon",
    });

    section.links.push({
        label: "Events",
        path: "/admin/events",
        icon: adminEventsIcon,
        badge: "Soon",
    });

    section.links.push({
        label: "Discussions",
        path: "/admin/discussions",
        icon: adminDiscussionsIcon,
        badge: "Soon",
    });

    return section.links.length > 0 ? section : null;
};

export const Sidebar = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose?: () => void;
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const permissions = useAppSelector((state) => state.user.permissions);
    const [logout] = useLogoutMutation();
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [navSections, setNavSections] = useState<NavSection[]>([
        ...navSectionsDefault,
    ]);
    useEffect(() => {
        if (permissions) {
            const section = showAdminLinks(permissions);
            if (section) {
                setNavSections((prev) => [
                    section,
                    ...prev.filter((s) => s.title !== "Admin Pages"),
                ]);
            }
        }
    }, [permissions]);

    const toggleSection = (title: string) => {
        setExpandedSections((prev) =>
            prev.includes(title)
                ? prev.filter((t) => t !== title)
                : [...prev, title],
        );
    };

    const isLinkActive = (link: NavLink) => {
        if (location.pathname === link.path) return true;
        if (
            link.activatesPaths &&
            link.activatesPaths.some((path) => location.pathname.includes(path))
        )
            return true;
        return false;
    };

    const isSectionActive = (section: NavSection) => {
        return section.links.some(
            (link) =>
                (location.pathname.includes(link.path) &&
                    link.path !== "/user") ||
                (location.pathname === "/user" && link.path === "/user"),
        );
    };

    useEffect(() => {
        setExpandedSections((prev) => {
            const newExpanded = [...prev];
            navSections.forEach((section) => {
                const isActive = section.links.some(
                    (link) =>
                        (location.pathname.includes(link.path) &&
                            link.path !== "/user") ||
                        (location.pathname === "/user" &&
                            link.path === "/user"),
                );
                if (isActive && !newExpanded.includes(section.title)) {
                    newExpanded.push(section.title);
                }
            });
            return newExpanded;
        });
    }, [location.pathname, navSections]);

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            navigate("/login", {
                state: {
                    success: "You have been logged out successfully.",
                },
            });
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <div
            className={`${styles.sidebar} ${isOpen ? "" : styles.hidden}`}
            onClick={(e) => {
                if (e.target === e.currentTarget && onClose) {
                    onClose();
                }
            }}
        >
            <ul className={styles.nav}>
                <li className={styles.websiteLogo}>
                    <Logo width={110} height={110} />
                </li>

                {navSections.map((section) => (
                    <li
                        key={section.title}
                        className={`${expandedSections.includes(section.title) ? styles.active : ""} ${isSectionActive(section) ? styles.hasActive : ""}`}
                    >
                        <button
                            onClick={() => toggleSection(section.title)}
                            className={styles.sectionButton}
                        >
                            <span>{section.title}</span>
                            <img
                                src={dropdownIcon}
                                alt=""
                                width="20"
                                height="20"
                            />
                        </button>
                        <ul className={styles.subNav}>
                            {section.links.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={
                                            isLinkActive(link)
                                                ? styles.activeLink
                                                : ""
                                        }
                                    >
                                        <div className={styles.linkContent}>
                                            <img
                                                src={link.icon}
                                                alt=""
                                                width="20"
                                                height="20"
                                            />
                                            {link.label}
                                        </div>
                                        {link.badge && (
                                            <span
                                                className={`${styles.badge} ${styles[`badge${link.badge.replace(/\s/g, "")}`]}`}
                                            >
                                                {link.badge}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}

                <li className={styles.logoutItem}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <div className={styles.linkContent}>
                            <img
                                src={logoutIcon}
                                alt=""
                                width="20"
                                height="20"
                            />
                            Logout
                        </div>
                    </button>
                </li>

                <li className={styles.userCard}>
                    <img
                        src={GetAvatarLink(
                            user?.details?.avatar || user?.google_avatar || "",
                        )}
                        alt="User Avatar"
                        width="50"
                        height="50"
                    />
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.name}</span>
                        <span className={styles.userAcademic}>
                            {user?.department?.code} {user?.year?.year}
                        </span>
                    </div>
                    {user?.role && (
                        <span className={styles.userRole}>
                            {user.role.name}
                        </span>
                    )}
                </li>
            </ul>

            <div className={styles.endingSidebar}>
                <span>CU Portal</span>
                <span>© 2026 All Rights Reserved</span>
            </div>
        </div>
    );
};
