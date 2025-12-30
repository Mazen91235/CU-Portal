import { useState } from "react";
import Logo from "../logo/Logo";
import styles from "./Header.module.css";

export const Header = ({
    activeSection,
    setActiveSection,
}: {
    activeSection: string;
    setActiveSection: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
                        onClick={() => handleNavClick("hero")}
                    />
                </div>
                <nav className={styles.headerCenter}>
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
                    <a
                        href="#features"
                        className={`${styles.navLink} ${
                            activeSection === "features" ? styles.active : ""
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
                            activeSection === "how-it-work" ? styles.active : ""
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
                            activeSection === "snapshots" ? styles.active : ""
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
                </nav>
                <div className={styles.headerRight}>
                    <button className={styles.loginBtn}>Login</button>
                    <button className={styles.signupBtn}>Sign Up</button>
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
                    <li>
                        <a
                            href="#hero"
                            className={`${styles.sidebarLink} ${
                                activeSection === "hero" ? styles.active : ""
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavClick("hero");
                            }}
                        >
                            Home
                        </a>
                    </li>
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
                    <hr />
                    <li>
                        <button
                            className={`${styles.loginBtn} ${styles.sidebarBtn}`}
                        >
                            Login
                        </button>
                    </li>
                    <li>
                        <button
                            className={`${styles.signupBtn} ${styles.sidebarBtn}`}
                        >
                            Sign Up
                        </button>
                    </li>
                </ul>
            </nav>
        </>
    );
};
