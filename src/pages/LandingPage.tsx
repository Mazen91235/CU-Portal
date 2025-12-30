import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Snapshots } from "../components/landing/Snapshots";
import { BeginningStory } from "../components/landing/BeginningStory";
import { ContactForm } from "../components/landing/ContactForm";
import { Team } from "../components/landing/Team";
import { useEffect, useState } from "react";
import { Footer } from "../components/landing/Footer";
import { PageSeo } from "../components/PageSeo";
import styles from "./LandingPage.module.css";

export const LandingPage = () => {
    const [activeSection, setActiveSection] = useState("hero");
    const [sections, setSections] = useState<React.RefObject<HTMLElement>[]>(
        []
    );
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5 }
        );
        sections.forEach((section) => {
            if (section.current) {
                observer.observe(section.current);
            }
        });
        return () => {
            observer.disconnect();
        };
    }, [sections]);
    return (
        <>
            <PageSeo
                title="CU - Portal - Your Gateway to Campus Life"
                description="Discover the CU - Portal, your all-in-one platform for managing academics, campus activities, and student services seamlessly."
            />
            <div className={styles.landingPage}>
                <Header
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                />
                <Hero setSections={setSections} />
                <Features setSections={setSections} />
                <HowItWorks setSections={setSections} />
                <Snapshots setSections={setSections} />
                <BeginningStory setSections={setSections} />
                <ContactForm />
                <Team />
                <Footer />
            </div>
        </>
    );
};
