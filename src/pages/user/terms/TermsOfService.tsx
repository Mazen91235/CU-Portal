import { PageSeo } from "../../../components/PageSeo";
import { usePageLoading } from "../../../hooks/usePageLoading";

import styles from "./TermsOfService.module.css";

export const TermsOfService = () => {
    usePageLoading(true);
    return (
        <>
            <PageSeo
                title="Terms & Conditions - CU Portal"
                description="Read the terms and conditions for using CU Portal. Understand your rights and responsibilities as a Cairo University student on our platform."
            />
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.pageTitle}>Terms & Conditions</h1>
                    <p className={styles.effectiveDate}>
                        Effective Date: September 8, 2025
                    </p>
                    <p className={styles.introText}>
                        Welcome to <strong>cu-portal.com</strong> ("we", "our",
                        or "the Platform"). These Terms & Conditions govern your
                        use of the Platform and services. By accessing or using
                        our services, you agree to comply with these terms.
                    </p>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>1. Eligibility</h5>
                        <p className={styles.introText}>
                            You must be an enrolled student at Cairo University
                            to access and use this platform. Students may be 17
                            years old. If you are under 18, you agree to use the
                            platform responsibly.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            2. Account Registration & Login
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                You may register using your Cairo University
                                email or a personal email. Personal emails
                                require proof of enrollment.
                            </li>
                            <li>
                                Login is performed via Google OAuth. Only Google
                                logins are accepted; no other third-party logins
                                are allowed.
                            </li>
                            <li>
                                Users must verify their account via email
                                confirmation.
                            </li>
                            <li>
                                You are responsible for maintaining the
                                confidentiality of your login credentials and
                                for all activities conducted through your
                                account.
                            </li>
                            <li>
                                IP addresses are used to limit the number of
                                devices you can log in from and to detect
                                suspicious activity.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            3. Use of Services
                        </h5>
                        <ul className={styles.list}>
                            <li>The Platform is for academic purposes only.</li>
                            <li>
                                You may not upload illegal, harmful, or
                                malicious content.
                            </li>
                            <li>
                                Misuse of the service, including hacking
                                attempts or attempts to bypass login limits, may
                                result in suspension or termination.
                            </li>
                            <li>
                                Sharing files with other users is not allowed
                                unless explicitly permitted.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            4. File Storage & Responsibility
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                Files are uploaded directly to your Google
                                Drive. We only store metadata and links.
                            </li>
                            <li>
                                Users are fully responsible for the content,
                                legality, and security of their uploaded files.
                            </li>
                            <li>
                                We rely on Google encryption for secure storage
                                of credentials and files.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            5. Intellectual Property
                        </h5>
                        <p className={styles.introText}>
                            All platform content, branding, and design remain
                            the property of Cairo University. Users retain full
                            ownership of their uploaded files. Users may not
                            copy, reproduce, or redistribute platform assets
                            without permission.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            6. Limitation of Liability
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                We are not responsible for any loss of files
                                stored on your Google Drive.
                            </li>
                            <li>
                                We are not liable for damages caused by misuse,
                                user error, or actions outside our control.
                            </li>
                            <li>
                                Version 1 does not use any third-party services
                                or advertising. Advertising may be added in
                                future versions.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            7. Termination of Access
                        </h5>
                        <p className={styles.introText}>
                            We reserve the right to suspend or terminate your
                            account if you violate these Terms & Conditions,
                            applicable laws, or pose a security risk.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            8. Changes to Terms
                        </h5>
                        <p className={styles.introText}>
                            We may update these Terms & Conditions from time to
                            time. Continued use of the platform after changes
                            constitutes acceptance of the updated terms.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            9. Governing Law
                        </h5>
                        <p className={styles.introText}>
                            These Terms & Conditions are governed by the
                            applicable laws of the Arab Republic of Egypt.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>10. Contact Us</h5>
                        <p className={styles.introText}>
                            If you have any questions or concerns regarding
                            these Terms & Conditions, please contact us at:{" "}
                            <a
                                href="mailto:support@cu-portal.com"
                                className={styles.contactLink}
                            >
                                support@cu-portal.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </>
    );
};
