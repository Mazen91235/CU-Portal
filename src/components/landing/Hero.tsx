import heroImage from "../../assets/hero section photo.png";
import styles from "./Hero.module.css";

export const Hero = () => {
    return (
        <section className={styles.hero} id="hero">
            <div className={styles.heroText}>
                <h1>Simplify Your Student Life</h1>
                <h2>
                    <span className={styles.gradientText}>Succeed</span> Smarter
                </h2>
                <p className={styles.heroDescription}>
                    Organize your studies, track your progress, and connect with
                    your academic community.
                </p>
                <a href="/login" className={styles.ctaButton}>
                    Get Started Now!
                </a>
            </div>
            <div className={styles.heroImage}>
                <img
                    src={heroImage}
                    alt="Illustration of two students with books"
                />
            </div>
        </section>
    );
};
