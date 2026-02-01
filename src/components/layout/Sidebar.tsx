import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { useAppSelector } from "../../services/redux/Hooks";
import { useLogoutMutation } from "../../services/apis/AuthenticateAPIs";
import { type Icon } from "../../types/Icon";
import Logo from "../logo/Logo";

import { handlePopupErrors } from "../../utils/ErrorHandling";
import { GetAvatarLink, GetIcon } from "../../utils/LinkHandler";

import styles from "./Sidebar.module.css";

type BadgeType = "Soon" | "Beta" | "New" | "Early Access";

type NavLink = {
    label: string;
    path: string;
    icon: Icon;
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
            { label: "Home", path: "/user", icon: "sidebar-home" },
            {
                label: "Courses",
                path: "/user/courses",
                icon: "sidebar-courses",
            },
            {
                label: "Course Map",
                path: "/user/course-map",
                icon: "sidebar-coursemap",
            },
            {
                label: "Calendar",
                path: "/user/calendar",
                icon: "sidebar-calendar",
            },
            { label: "Tasks", path: "/user/tasks", icon: "sidebar-tasks" },
            { label: "Exams", path: "/user/exams", icon: "sidebar-exams" },
            {
                label: "Announcements",
                path: "/user/announcements",
                icon: "sidebar-announcements",
            },
            {
                label: "Materials",
                path: "/user/materials",
                icon: "sidebar-materials",
            },
            {
                label: "Other Materials",
                path: "/user/other-materials",
                icon: "sidebar-other-materials",
                badge: "Soon",
            },
            { label: "Grades", path: "/user/grades", icon: "sidebar-grades" },
        ],
    },
    {
        title: "Organization",
        links: [
            {
                label: "Study Tracker",
                path: "/user/study-tracker",
                icon: "sidebar-study-tracker",
                badge: "Soon",
            },
            {
                label: "Events",
                path: "/user/events",
                icon: "sidebar-events",
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
                icon: "sidebar-cv-generator",
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
                icon: "sidebar-roadmaps",
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
                icon: "sidebar-discussion",
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
                icon: "sidebar-profile-settings",
            },
            {
                label: "Academic Settings",
                path: "/user/settings/academic",
                icon: "sidebar-academic-settings",
            },
            {
                label: "Registered Courses",
                path: "/user/settings/courses",
                icon: "sidebar-registered-courses",
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
            icon: "sidebar-admin-dashboard",
            badge: "Soon",
        });
    }

    if (permissions.includes("View Faculties")) {
        section.links.push({
            label: "Faculties",
            path: "/admin/faculties",
            icon: "sidebar-admin-faculties",
        });
    }

    if (permissions.includes("View Departments")) {
        section.links.push({
            label: "Departments",
            path: "/admin/departments",
            icon: "sidebar-admin-departments",
        });
    }

    if (permissions.includes("View Years")) {
        section.links.push({
            label: "Years",
            path: "/admin/years",
            icon: "sidebar-admin-years",
        });
    }

    if (permissions.includes("View Course Maps")) {
        section.links.push({
            label: "Course Maps",
            path: "/admin/course-maps",
            icon: "sidebar-admin-course-maps",
        });
    }

    if (permissions.includes("View Users")) {
        section.links.push({
            label: "Users",
            path: "/admin/users",
            icon: "sidebar-admin-users",
            activatesPaths: ["/admin/pending-users"],
        });
    }

    if (permissions.includes("View Roles")) {
        section.links.push({
            label: "Roles",
            path: "/admin/roles",
            icon: "sidebar-admin-roles",
        });
    }

    if (permissions.includes("View Courses")) {
        section.links.push({
            label: "Courses",
            path: "/admin/courses",
            icon: "sidebar-admin-courses",
            activatesPaths: ["/admin/courses/"],
        });
    }

    if (permissions.includes("View Materials")) {
        section.links.push({
            label: "Materials",
            path: "/admin/materials",
            icon: "sidebar-admin-materials",
        });
    }

    if (permissions.includes("View Grades")) {
        section.links.push({
            label: "Grades",
            path: "/admin/grades",
            icon: "sidebar-admin-grades",
        });
    }

    if (permissions.includes("View Tasks")) {
        section.links.push({
            label: "Tasks",
            path: "/admin/tasks",
            icon: "sidebar-admin-tasks",
            activatesPaths: ["/admin/tasks/"],
        });
    }

    if (permissions.includes("View Exams")) {
        section.links.push({
            label: "Exams",
            path: "/admin/exams",
            icon: "sidebar-admin-exams",
            activatesPaths: ["/admin/exams/"],
        });
    }

    if (permissions.includes("View Announcements")) {
        section.links.push({
            label: "Announcements",
            path: "/admin/announcements",
            icon: "sidebar-admin-announcements",
            activatesPaths: ["/admin/announcements/"],
        });
    }

    if (permissions.includes("View Logs")) {
        section.links.push({
            label: "Logs",
            path: "/admin/logs",
            icon: "sidebar-admin-logs",
        });
    }

    section.links.push({
        label: "Roadmaps",
        path: "/admin/roadmaps",
        icon: "sidebar-admin-roadmaps",
        badge: "Soon",
    });

    section.links.push({
        label: "Study Maps",
        path: "/admin/study-maps",
        icon: "sidebar-admin-study-maps",
        badge: "Soon",
    });

    section.links.push({
        label: "Study Analysis",
        path: "/admin/study-analysis",
        icon: "sidebar-admin-study-analysis",
        badge: "Soon",
    });

    section.links.push({
        label: "Events",
        path: "/admin/events",
        icon: "sidebar-admin-events",
        badge: "Soon",
    });

    section.links.push({
        label: "Discussions",
        path: "/admin/discussions",
        icon: "sidebar-admin-discussions",
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
                                src={GetIcon("sidebar-dropdown")}
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
                                                src={GetIcon(link.icon)}
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
                                src={GetIcon("sidebar-logout")}
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
