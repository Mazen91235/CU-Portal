import styles from "./Footer.module.css";

export const Footer = () => {
    const handleFooterLinkClick = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerBranding}>
                St<span className={styles.footerHighlight}>u</span>dent P
                <span className={styles.footerHighlight}>o</span>rtal
            </div>
            <div className={styles.footerLinks}>
                <a
                    href="#Snapshots"
                    className={styles.footerLink}
                    onClick={(e) => {
                        e.preventDefault();
                        handleFooterLinkClick("Snapshots");
                    }}
                >
                    Snapshots
                </a>
                <a
                    href="#team-section"
                    className={styles.footerLink}
                    onClick={(e) => {
                        e.preventDefault();
                        handleFooterLinkClick("team-section");
                    }}
                >
                    Our team
                </a>
                <a
                    href="#contact-form-section"
                    className={styles.footerLink}
                    onClick={(e) => {
                        e.preventDefault();
                        handleFooterLinkClick("contact-form-section");
                    }}
                >
                    Contact Us
                </a>
            </div>
            <div className={styles.footerSecondaryLinks}>
                <a
                    href="/privacy-policy"
                    className={styles.footerSecondaryLink}
                >
                    Privacy Policy
                </a>
                <a
                    href="/terms-of-service"
                    className={styles.footerSecondaryLink}
                >
                    Terms & Conditions
                </a>
            </div>
        </footer>
    );
};
