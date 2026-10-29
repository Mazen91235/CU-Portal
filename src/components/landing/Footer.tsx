import { Link } from "react-router";
import { isPlatformSuspended } from "../../utils/PlatformStatus";
import styles from "./Footer.module.css";

export const Footer = ({ compact = false }: { compact?: boolean }) => {
    const handleFooterLinkClick = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer className={styles.footer}>
            {!compact && (
                <>
                    <div className={styles.footerLinks}>
                        <button
                            className={styles.footerLink}
                            onClick={() => handleFooterLinkClick("snapshots")}
                        >
                            Snapshots
                        </button>
                        <button
                            className={styles.footerLink}
                            onClick={() =>
                                handleFooterLinkClick("team-section")
                            }
                        >
                            Our team
                        </button>
                        {!isPlatformSuspended() && (
                            <button
                                className={styles.footerLink}
                                onClick={() =>
                                    handleFooterLinkClick(
                                        "contact-form-section",
                                    )
                                }
                            >
                                Contact Us
                            </button>
                        )}
                    </div>
                </>
            )}
            <div className={styles.footerSecondaryLinks}>
                <Link
                    to="/privacy-policy"
                    className={styles.footerSecondaryLink}
                >
                    Privacy Policy
                </Link>
                <Link
                    to="/terms-of-service"
                    className={styles.footerSecondaryLink}
                >
                    Terms & Conditions
                </Link>
            </div>
        </footer>
    );
};
