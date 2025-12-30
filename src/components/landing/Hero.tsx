import { useRef, useEffect } from "react";
import heroImage from "../../assets/hero section photo.png";
import styles from "./Hero.module.css";

export const Hero = ({
    setSections,
}: {
    setSections: React.Dispatch<
        React.SetStateAction<React.RefObject<HTMLElement>[]>
    >;
}) => {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        if (ref.current)
            setSections((state) => [
                ...state,
                ref as React.RefObject<HTMLElement>,
            ]);
    }, [setSections]);
    return (
        <section ref={ref} className={styles.hero} id="hero">
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
