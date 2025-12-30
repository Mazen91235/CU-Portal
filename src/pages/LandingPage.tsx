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

export const LandingPage = () => {
    return (
        <>
            <PageSeo
                title="CU - Portal - Your Gateway to Campus Life"
                description="Discover the CU - Portal, your all-in-one platform for managing academics, campus activities, and student services seamlessly."
            />
            <div className={styles.landingPage}>
                <Header />
                <Hero />
                <Features />
                <HowItWorks />
                <Snapshots />
                <BeginningStory />
                <ContactForm />
                <Team />
                <Footer />
            </div>
        </>
    );
};
