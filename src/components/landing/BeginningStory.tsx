import beginningImage from "../../assets/beginning-illustration.png";
import styles from "./BeginningStory.module.css";

export const BeginningStory = () => {
    return (
        <section className={styles.beginningSection} id="beginning-card">
            <div
                className={`${styles.beginningCard} ${styles.beginningFlexContainer}`}
            >
                <h2 className={styles.beginningTitle}>How Did We Start</h2>
                <div className={styles.beginningRow}>
                    <div className={styles.beginningContent}>
                        <p>
                            In 2024, <strong>Mazen</strong> came up with the
                            idea of creating a platform where university
                            students could study, share resources, and connect.
                            But the idea remained simple — a seed that hadn't
                            yet grown.
                        </p>
                        <p>
                            After a year - In 2025 - <strong>Mohamed</strong>{" "}
                            came with a similar concept, but with a fresh
                            perspective focused on what students actually need
                            in their academic journey. When{" "}
                            <strong>Mohamed</strong> shared his vision,{" "}
                            <strong>Mazen</strong> saw the spark of his old idea
                            reignited — only stronger this time. They teamed up,
                            determined to build something real and impactful.
                        </p>
                        <p>
                            <strong>Shahd</strong>, a former member of the team,
                            suggested creating a survey to gather feedback and
                            opinions from students — a step that helped shape
                            the direction of the platform based on real needs.
                        </p>
                        <p>
                            To turn their vision into action, they reached out
                            to <strong>Jana</strong>, a skilled programmer who
                            helped lay the technical foundation. Soon after,{" "}
                            <strong>Yasmine</strong>, a professional full-stack
                            developer, joined to support the development
                            process. The UI/UX team — <strong>Marwa</strong>,{" "}
                            <strong>Hadeer</strong>, and <strong>Somaya</strong>{" "}
                            — played a crucial role in designing the user
                            experience and interface, ensuring the platform was
                            both intuitive and visually appealing.
                        </p>
                        <p>
                            Seven minds, one mission — to create a platform that
                            transforms the student experience and brings the
                            university community closer together.
                        </p>
                    </div>
                    <div className={styles.beginningImageContainer}>
                        <img
                            src={beginningImage}
                            alt="Our Beginning"
                            className={styles.beginningSideImage}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
