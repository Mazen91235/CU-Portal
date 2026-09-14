import { Link } from "react-router";
import type { UserResponseDto } from "../../types/dtos/UserDtos";
import { usePageLoading } from "../../hooks/usePageLoading";

import welcomeCharacter from "../../assets/decorations/login-illustration.png";
import styles from "./DashboardProgressView.module.css";

type ProgressStep = {
    id: number;
    icon: string;
    title: string;
    description: string;
    tasks: string[];
    buttonText: string;
    buttonLink: string;
    completed: boolean;
    current: boolean;
};

export const DashboardProgressView = ({
    userLevel,
    user,
}: {
    userLevel: number;
    user: UserResponseDto;
}) => {
    usePageLoading(true);

    const isSuspended = user.status === false && !user.pending_user;

    if (isSuspended) {
        return (
            <div className={styles["progress-container"]}>
                <div className={styles["welcome-section"]}>
                    <div className={styles["progress-card"]}>
                        <div className={styles["progress-header"]}>
                            <div>
                                <h3 className={styles["progress-title"]}>
                                    Your Account Is Suspended
                                </h3>
                                <p className={styles["progress-subtitle"]}>
                                    Access to your CU Portal account is currently suspended.
                                </p>
                            </div>
                            <div className={styles["progress-stats"]}>
                                <span className={styles["progress-percentage"]}>
                                    <i className="fas fa-lock"></i>
                                </span>
                            </div>
                        </div>
                        <p className={styles["progress-encouragement"]}>
                            Please contact our support team to request that your account be reviewed and unsuspended.
                        </p>
                    </div>
                </div>

                <div className={styles["steps-grid"]}>
                    <div className={styles["steps-column"]}>
                        <div className={`${styles["step-card"]} ${styles["current"]}`}>
                            <div className={styles["step-icon"]}>
                                <i className="fas fa-user-lock"></i>
                            </div>
                            <div className={styles["step-content"]}>
                                <h4 className={styles["step-title"]}>
                                    Account Suspended
                                </h4>
                                <p className={styles["step-description"]}>
                                    Your profile is saved, but your account cannot currently access the portal. Our support team can help you resolve the suspension.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={styles["steps-column"]}>
                        <div className={styles["help-card"]}>
                            <div className={styles["help-icon"]}>
                                <i className="fas fa-headset"></i>
                            </div>
                            <div className={styles["help-content"]}>
                                <h4 className={styles["help-title"]}>
                                    Need your account restored?
                                </h4>
                                <p className={styles["help-description"]}>
                                    Contact support and ask us to review your account suspension.
                                </p>
                                <a
                                    href="https://wa.me/+201281518436"
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles["contact-button"]}
                                >
                                    Contact support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    const steps: ProgressStep[] = [
        {
            id: 1,
            icon: "fa-user-circle",
            title: "Complete Your Profile",
            description: "Add your photo, personal information to get started",
            tasks: [],
            buttonText: "Complete",
            buttonLink: "/user/settings/profile",
            completed: userLevel > 0,
            current: false,
        },
        {
            id: 2,
            icon: "fa-user-circle",
            title: "Complete Your Academic Profile",
            description:
                "Setup Your Faculty, Department, Year, and other academic details to proceed",
            tasks: [],
            buttonText: "Complete",
            buttonLink: "/user/settings/academic",
            completed: userLevel > 1,
            current: userLevel === 1,
        },
        {
            id: 3,
            icon: "fa-check-circle",
            title: "Get Your Account Verified",
            description:
                "Wait for your account to be verified by our support team",
            tasks: [],
            buttonText: "",
            buttonLink: "",
            completed: userLevel > 2,
            current: userLevel === 2,
        },
        {
            id: 4,
            icon: "fa-book-open",
            title: "Setup Enrolled Courses",
            description:
                "Add your enrolled courses to start tracking your progress",
            tasks: [],
            buttonText: "Complete",
            buttonLink: "/user/settings/courses",
            completed: userLevel > 3,
            current: userLevel === 3,
        },
    ];

    const progress = (userLevel / 4) * 100;
    const stepsLeft = 4 - userLevel;

    return (
        <div className={styles["progress-container"]}>
            <div className={styles["welcome-section"]}>
                <div className={styles["welcome-card"]}>
                    <img
                        src={welcomeCharacter}
                        alt="Welcome"
                        className={styles["welcome-character"]}
                    />
                    <div className={styles["welcome-content"]}>
                        <div className={styles["welcome-badge"]}>
                            <span className={styles["wave-emoji"]}>👋</span>
                            <span className={styles["welcome-text"]}>
                                Let's get your account ready!
                            </span>
                        </div>
                        <p className={styles["welcome-description"]}>
                            Complete these smart steps to unlock the full
                            potential of your CU Portal experience.
                        </p>
                    </div>
                </div>

                <div className={styles["progress-card"]}>
                    <div className={styles["progress-header"]}>
                        <div>
                            <h3 className={styles["progress-title"]}>
                                Your Progress
                            </h3>
                            <p className={styles["progress-subtitle"]}>
                                Step {userLevel} of 4 · {Math.round(progress)}%
                                Complete
                            </p>
                        </div>
                        <div className={styles["progress-stats"]}>
                            <span className={styles["progress-percentage"]}>
                                {Math.round(progress)}%
                            </span>
                            <span className={styles["steps-left"]}>
                                {stepsLeft} steps left
                            </span>
                        </div>
                    </div>
                    <p className={styles["progress-encouragement"]}>
                        Good start! You're on your way.
                    </p>
                    <div className={styles["progress-bar-container"]}>
                        <div
                            className={styles["progress-bar"]}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className={styles["steps-grid"]}>
                <div className={styles["steps-column"]}>
                    {steps.slice(0, 4).map((step) => (
                        <div
                            key={step.id}
                            className={`${styles["step-card"]} ${step.completed ? styles["completed"] : ""} ${step.current ? styles["current"] : ""} ${!step.completed && !step.current ? styles["upcoming"] : ""}`}
                        >
                            <div className={styles["step-icon"]}>
                                <i className={`fas ${step.icon}`}></i>
                            </div>
                            <div className={styles["step-content"]}>
                                <h4 className={styles["step-title"]}>
                                    {step.title}
                                </h4>
                                <p className={styles["step-description"]}>
                                    {step.description}
                                </p>
                                {step.tasks.length > 0 && (
                                    <ul className={styles["task-list"]}>
                                        {step.tasks.map((task, index) => (
                                            <li key={index}>
                                                <i className="far fa-circle"></i>
                                                <span>{task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {step.buttonText && !step.completed && (
                                <Link
                                    to={step.buttonLink}
                                    className={styles["step-button"]}
                                >
                                    {step.buttonText}
                                </Link>
                            )}
                            {step.completed && (
                                <div className={styles["completed-checkmark"]}>
                                    <i className="fas fa-check"></i>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles["steps-column"]}>
                    <div className={styles["info-card"]}>
                        <div className={styles["info-icon"]}>
                            <i className="fas fa-lightbulb"></i>
                        </div>
                        <div className={styles["info-content"]}>
                            <h4 className={styles["info-title"]}>
                                Stay Organized
                            </h4>
                            <p className={styles["info-description"]}>
                                Students who complete their setup are 3x more
                                likely to achieve their academic goals.
                            </p>
                            <div className={styles["pro-tip"]}>
                                <i className="fas fa-star"></i>
                                <span>
                                    Pro tip: Return to this setup anytime from
                                    your settings
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles["help-card"]}>
                        <div className={styles["help-icon"]}>
                            <i className="fas fa-question-circle"></i>
                        </div>
                        <div className={styles["help-content"]}>
                            <h4 className={styles["help-title"]}>Need Help?</h4>
                            <p className={styles["help-description"]}>
                                Our support team is here to help you succeed
                            </p>
                            <Link
                                to="https://wa.me/+201281518436"
                                className={styles["contact-button"]}
                            >
                                Contact support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
