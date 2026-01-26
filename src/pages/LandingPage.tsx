import { useState } from "react";
import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Snapshots } from "../components/landing/Snapshots";
import { BeginningStory } from "../components/landing/BeginningStory";
import { ContactForm } from "../components/landing/ContactForm";
import { Team } from "../components/landing/Team";
import { Footer } from "../components/landing/Footer";
import { PageSeo } from "../components/PageSeo";
import styles from "./LandingPage.module.css";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";

export const LandingPage = () => {
    const [activeSection, setActiveSection] = useState("hero");
    const [sections, setSections] = useState<React.RefObject<HTMLElement>[]>(
        [],
    );
    useIntersectionObserver(sections, (entry) => {
        setActiveSection(entry.target.id);
    });
    return (
        <>
            <PageSeo
                title="Home - CU Portal"
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
