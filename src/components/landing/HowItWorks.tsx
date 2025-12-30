import { useRef, useEffect } from "react";
import userIcon from "../../assets/icons/iconsax-user.png";
import dashboardIcon from "../../assets/icons/dashboard-personalize.png";
import statusIcon from "../../assets/icons/iconsax-status-up.png";
import styles from "./HowItWorks.module.css";

const steps = [
    {
        icon: userIcon,
        title: "Create Your Account",
        description:
            "Join our community in just a few clicks. It's quick, simple, and absolutely free",
    },
    {
        icon: dashboardIcon,
        title: "Personalize Your Dashboard",
        description:
            "Input your class schedules, assignments, and exam dates. Our intuitive tools help you get organized in minutes.",
    },
    {
        icon: statusIcon,
        title: "Thrive In Your Studies",
        description:
            "Access all the resources you need, get timely reminders, and connect with a supportive community. It's time to reach your full potential.",
    },
];

export const HowItWorks = ({
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
        <>
            <section ref={ref} className={styles.howItWork} id="how-it-work">
                <div>
                    <h2 className={styles.howItWorkTitle}>How It Works</h2>
                    <h2 className={styles.howItWorkSubtitle}>
                        Your Success in 3 Simple Steps
                    </h2>
                </div>
            </section>
            <section className={styles.simpleStepsSection}>
                <div className={styles.mainStepsCard}>
                    <div className={styles.simpleStepsContainer}>
                        {steps.map((step, index) => (
                            <div key={index} className={styles.simpleStepGroup}>
                                <div className={styles.simpleStepIconAbove}>
                                    <img src={step.icon} alt={step.title} />
                                </div>
                                <div className={styles.simpleStepCard}>
                                    <div className={styles.simpleStepTitle}>
                                        {step.title}
                                    </div>
                                    <div className={styles.simpleStepDesc}>
                                        {step.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.simpleStepsCta}>
                        <button className={styles.simpleStepsBtn}>
                            Organize Your Academic Life
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
};
