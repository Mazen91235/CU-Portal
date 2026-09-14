import { PageSeo } from "../../../components/PageSeo";
import { usePageLoading } from "../../../hooks/usePageLoading";

import styles from "./PrivacyPolicyPage.module.css";

export const PrivacyPolicyPage = () => {
    usePageLoading(true);
    return (
        <>
            <PageSeo
                title="Privacy Policy - CU Portal"
                description="Learn how CU Portal collects, uses, and protects your information. Our privacy policy explains data handling for Cairo University students."
            />
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.pageTitle}>Privacy Policy</h1>
                    <p className={styles.effectiveDate}>
                        Effective Date: September 8, 2025
                    </p>
                    <p className={styles.introText}>
                        <strong>cu-portal.com</strong> ("we", "our", or "the
                        Platform") is a student study management system designed
                        exclusively for students of Cairo University. This
                        Privacy Policy explains how we collect, use, and protect
                        your information when you use our services.
                    </p>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            1. Information We Collect
                        </h5>
                        <dl className={styles.definitionList}>
                            <dt>
                                <strong>Account Information</strong>
                            </dt>
                            <dd>
                                Full name, Cairo University email address or
                                personal email with proof of enrollment, and
                                academic year.
                            </dd>
                            <dt>
                                <strong>Authentication Data</strong>
                            </dt>
                            <dd>
                                Encrypted Google Drive refresh tokens (used only
                                to generate access tokens when you upload or
                                retrieve study materials).
                            </dd>
                            <dt>
                                <strong>Usage Logs</strong>
                            </dt>
                            <dd>
                                Login/logout records, device IP addresses,
                                browser type, failed login attempts, and
                                suspicious activity. IP addresses are used to
                                limit the number of devices a user can log in
                                from.
                            </dd>
                            <dt>
                                <strong>Files &amp; Materials</strong>
                            </dt>
                            <dd>
                                Metadata of uploaded materials (filename, type,
                                link). The actual file is stored on your
                                personal Google Drive, not our servers.
                            </dd>
                            <dt>
                                <strong>Cookies &amp; Device Data</strong>
                            </dt>
                            <dd>
                                Cookies and general device information to
                                improve service performance and user experience.
                            </dd>
                        </dl>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            2. How We Use Your Information
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                To provide secure login and access to study
                                materials.
                            </li>
                            <li>
                                To manage and link academic files with your
                                Google Drive.
                            </li>
                            <li>
                                To verify student eligibility (Cairo University
                                students only).
                            </li>
                            <li>
                                To detect, prevent, and respond to fraudulent or
                                malicious activities.
                            </li>
                            <li>
                                To personalize your experience and improve
                                platform usability.
                            </li>
                            <li>
                                To send important service updates,
                                notifications, or support messages.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            3. Google Account Login
                        </h5>
                        <p className={styles.introText}>
                            We allow you to sign in using your Google account.
                            By doing so, we collect your name, email address,
                            and encrypted access credentials solely to allow
                            uploading and retrieving study materials from your
                            Google Drive. Your data is never shared with
                            unauthorized third parties. You can revoke access at
                            any time via your Google account settings.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            4. Cookies and Tracking
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                We use cookies to remember your login session
                                and preferences.
                            </li>
                            <li>
                                Cookies may also be used for analytics to
                                understand platform performance.
                            </li>
                            <li>
                                You can disable cookies in your browser
                                settings, but some features may not work
                                properly.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            5. File Uploads and Google Drive
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                Files are uploaded directly to your Google
                                Drive. We only store file links and metadata.
                            </li>
                            <li>
                                We verify file type by extension (e.g., PDF,
                                image, audio, video).
                            </li>
                            <li>
                                We do not scan files for malware. Responsibility
                                for uploaded content rests with the user.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            6. Data Protection
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                Google refresh tokens are stored securely in
                                encrypted form.
                            </li>
                            <li>
                                We implement industry-standard security
                                practices to protect your information, including
                                limiting device logins by IP.
                            </li>
                            <li>
                                We do not sell or share your personal data with
                                unauthorized third parties.
                            </li>
                            <li>
                                You may revoke Google Drive access at any time
                                via your Google account settings.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            7. Data Retention
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                We retain your account data as long as you
                                maintain an active account.
                            </li>
                            <li>
                                Upon account deletion, associated data will be
                                permanently removed within a reasonable time.
                            </li>
                            <li>
                                Some metadata may be retained for security,
                                auditing, or legal purposes.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            8. Third-Party Services
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                Currently, our platform does not use any
                                third-party services, analytics tools, or
                                advertising. Future versions may include such
                                services, which will be disclosed in this
                                Privacy Policy.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>9. Your Rights</h5>
                        <ul className={styles.list}>
                            <li>
                                You may request access, correction, or deletion
                                of your personal data.
                            </li>
                            <li>
                                You may revoke our access to your Google Drive
                                at any time.
                            </li>
                            <li>
                                You may contact us for clarification or
                                complaints regarding your data.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            10. Children's Privacy
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                Our platform is intended only for Cairo
                                University students.
                            </li>
                            <li>
                                Students must be at least 18 years old. We do
                                not knowingly collect extra sensitive
                                information beyond account and academic details.
                            </li>
                            <li>
                                If you believe we have collected inappropriate
                                information, please contact us immediately.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            11. Limitations of Responsibility
                        </h5>
                        <ul className={styles.list}>
                            <li>
                                We are not responsible for malicious content
                                stored on a user's Google Drive.
                            </li>
                            <li>
                                We are not responsible for any loss of files
                                caused by user actions or third-party services.
                            </li>
                        </ul>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            12. Changes to This Policy
                        </h5>
                        <p className={styles.introText}>
                            We may update this Privacy Policy from time to time.
                            When changes are made, we will revise the "Effective
                            Date" above. Significant updates may also be
                            communicated to you directly.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>
                            13. Governing Law
                        </h5>
                        <p className={styles.introText}>
                            This Privacy Policy is governed by the applicable
                            laws of the Arab Republic of Egypt.
                        </p>
                    </section>

                    <section className={styles.section}>
                        <h5 className={styles.sectionTitle}>14. Contact Us</h5>
                        <p className={styles.introText}>
                            If you have any questions, concerns, or requests
                            regarding this Privacy Policy, please contact us at:{" "}
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
