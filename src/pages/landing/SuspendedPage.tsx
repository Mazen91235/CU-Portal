import { PageSeo } from "../../components/PageSeo";
import { Header } from "../../components/landing/Header";
import styles from "./SuspendedPage.module.css";

export const SuspendedPage = () => {
    return (
        <>
            <PageSeo
                title="Platform Suspended - CU Portal"
                description="CU Portal is no longer available."
            />
            <div className={styles.suspendedPage}>
                <Header
                    activeSection=""
                    setActiveSection={() => {}}
                    variant="suspended"
                    showActions={false}
                />
                <main className={styles.content}>
                    <section className={styles.notice}>
                        <span className={styles.eyebrow}>CU-Portal</span>
                        <h1 className={styles.title}>Suspension Notice</h1>
                        <p className={styles.message}>
                            We are sorry to inform you that CU-Portal has been
                            suspended. The recognition and active participation
                            we hoped for did not reach the level needed to
                            sustain the team&apos;s considerable work,
                            development and maintenance costs, and DevOps
                            responsibilities.
                        </p>
                        <p className={styles.message}>
                            Alongside the low number of active users, these
                            circumstances led us to the difficult decision to
                            bring this journey to an end. Thank you to everyone
                            who gave CU-Portal their time and support.
                        </p>
                    </section>
                </main>
            </div>
        </>
    );
};
