import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAppSelector } from "../../services/redux/Hooks";
import Logo from "../logo/Logo";
import styles from "./Header.module.css";

export const Header = ({
    activeSection,
    setActiveSection,
    variant = "landing",
    showActions = true,
}: {
    activeSection: string;
    setActiveSection: React.Dispatch<React.SetStateAction<string>>;
    variant?: "landing" | "team" | "suspended";
    showActions?: boolean;
}) => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = useAppSelector((state) => state.user.user);
    const isTeamPage = variant !== "landing";
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleNavClick = (sectionId: string) => {
        setActiveSection(sectionId);
        closeSidebar();
        const section = document.getElementById(sectionId);
        if (section) {
            const header = document.querySelector(`.${styles.mainHeader}`);
            const headerHeight = header
                ? (header as HTMLElement).offsetHeight
                : 0;
            const sectionTop =
                section.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: sectionTop - headerHeight,
                behavior: "smooth",
            });
        }
    };

    return (
        <>
            <header className={styles.mainHeader}>
                <div className={styles.headerLeft}>
                    <Logo
                        width={60}
                        height={60}
                        onClick={() => {
                            if (isTeamPage) {
                                navigate("/");
                            } else {
                                handleNavClick("hero");
                            }
                        }}
                    />
                </div>
                <nav className={styles.headerCenter}>
                    {isTeamPage ? (
                        <>
                            <Link to="/" className={styles.navLink}>
                                Home
                            </Link>
                            <Link
                                to="/our-team"
                                className={`${styles.navLink} ${
                                    variant === "team" ? styles.active : ""
                                }`}
                            >
                                Our Team
                            </Link>
                        </>
                    ) : (
                        <a
                            href="#hero"
                            className={`${styles.navLink} ${
                                activeSection === "hero" ? styles.active : ""
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick("hero");
                            }}
                        >
                            Home
                        </a>
                    )}
                    {!isTeamPage && (
                        <>
                            <a
                                href="#features"
                                className={`${styles.navLink} ${
                                    activeSection === "features"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavClick("features");
                                }}
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-work"
                                className={`${styles.navLink} ${
                                    activeSection === "how-it-work"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavClick("how-it-work");
                                }}
                            >
                                How to Start
                            </a>
                            <a
                                href="#snapshots"
                                className={`${styles.navLink} ${
                                    activeSection === "snapshots"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavClick("snapshots");
                                }}
                            >
                                Snapshots
                            </a>
                            <a
                                href="#beginning-card"
                                className={`${styles.navLink} ${
                                    activeSection === "beginning-card"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavClick("beginning-card");
                                }}
                            >
                                How We Started
                            </a>
                        </>
                    )}
                </nav>
                <div className={styles.headerRight}>
                    {showActions && (!user ? (
                        <>
                            <Link to="/login" className={styles.loginBtn}>
                                Login
                            </Link>
                            <Link to="/login" className={styles.signupBtn}>
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <Link to="/user" className={styles.dashboardBtn}>
                            Dashboard
                        </Link>
                    ))}
                    <button
                        className={`${styles.mobileMenuToggle} ${
                            sidebarOpen ? styles.menuOpen : ""
                        }`}
                        onClick={toggleSidebar}
                        aria-label="Toggle mobile menu"
                    >
                        &#9776;
                    </button>
                </div>
            </header>

            <nav
                className={`${styles.sidebar} ${
                    sidebarOpen ? styles.active : ""
                }`}
            >
                <div className={styles.sidebarHeader}>
                    <button className={styles.closeBtn} onClick={closeSidebar}>
                        &times;
                    </button>
                </div>
                <ul>
                    {isTeamPage ? (
                        <>
                            <li>
                                <Link
                                    to="/"
                                    className={styles.sidebarLink}
                                    onClick={closeSidebar}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/our-team"
                                    className={`${styles.sidebarLink} ${
                                        variant === "team"
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={closeSidebar}
                                >
                                    Our Team
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li>
                            <a
                                href="#hero"
                                className={`${styles.sidebarLink} ${
                                    activeSection === "hero"
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleNavClick("hero");
                                }}
                            >
                                Home
                            </a>
                        </li>
                    )}
                    {!isTeamPage && (
                        <>
                            <li>
                                <a
                                    href="#features"
                                    className={`${styles.sidebarLink} ${
                                        activeSection === "features"
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick("features");
                                    }}
                                >
                                    Features
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#how-it-work"
                                    className={`${styles.sidebarLink} ${
                                        activeSection === "how-it-work"
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick("how-it-work");
                                    }}
                                >
                                    How It Works
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#snapshots"
                                    className={`${styles.sidebarLink} ${
                                        activeSection === "snapshots"
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick("snapshots");
                                    }}
                                >
                                    Snapshots
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#beginning-card"
                                    className={`${styles.sidebarLink} ${
                                        activeSection === "beginning-card"
                                            ? styles.active
                                            : ""
                                    }`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleNavClick("beginning-card");
                                    }}
                                >
                                    How We Started
                                </a>
                            </li>
                        </>
                    )}
                    {showActions && <hr />}
                    {showActions && (!user ? (
                        <>
                            <li>
                                <Link
                                    to="/login"
                                    className={`${styles.loginBtn} ${styles.sidebarBtn}`}
                                >
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/login"
                                    className={`${styles.signupBtn} ${styles.sidebarBtn}`}
                                >
                                    Sign Up
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link
                                to="/user"
                                className={`${styles.dashboardBtn} ${styles.sidebarBtn}`}
                            >
                                Dashboard
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};
