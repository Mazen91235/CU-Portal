import { useNavigate } from "react-router";
import { teamMembers } from "../../data/TeamData";
import styles from "./Team.module.css";

export const Team = () => {
    const navigate = useNavigate();
    const displayedMembers = teamMembers.filter(
        (member) =>
            member.badge === "Founder & Team Lead" ||
            member.badge === "Contributor"
    );

    return (
        <section className={styles.teamSection} id="team-section">
            <h2 className={styles.teamTitle}>Our Team</h2>
            <div className={styles.teamMembers}>
                {displayedMembers.map((member, index) => (
                    <div key={index} className={styles.teamCard}>
                        {member.badge && (
                            <div>
                                <span className={styles.teamBadge}>
                                    {member.badge}
                                </span>
                            </div>
                        )}
                        <div className={styles.teamCardSemicircle}>
                            <img
                                src={member.image}
                                alt={member.name}
                                className={styles.teamIcon}
                            />
                        </div>
                        <div className={styles.teamName}>{member.name}</div>
                        <div className={styles.teamRole}>
                            <span className={styles.roleTitle}>
                                {member.roleTitle}
                            </span>
                            <br />
                            {member.role}
                            <br />
                            {member.university}
                        </div>
                        {member.socials.length > 0 && (
                            <div className={styles.teamSocials}>
                                {member.socials.map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <img src={social.icon} alt="Social" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.viewAllContainer}>
                <button
                    className={styles.viewAllBtn}
                    onClick={() => navigate("/our-team")}
                >
                    View All Team
                </button>
            </div>
        </section>
    );
};
