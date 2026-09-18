import { useNavigate } from "react-router";
import { teamMembers } from "../../data/TeamData";
import styles from "./Team.module.css";

export const Team = () => {
    const navigate = useNavigate();
    const displayedMembers = teamMembers.filter(
        (member) =>
            member.badge?.toLocaleLowerCase().includes("founder") ||
            (member.badge?.toLocaleLowerCase().includes("partner") &&
                !member.badge?.toLocaleLowerCase().includes("former")),
    );

    return (
        <section className={styles.teamSection} id="team-section">
            <h2 className={styles.teamTitle}>Our Team</h2>
            <div className={styles.teamMembers}>
                {displayedMembers.map((member, index) => {
                    const additionalRoles = member.additionalRoles ?? [];
                    const visibleRoles = additionalRoles.slice(0, 2);
                    const remainingRoles = Math.max(
                        additionalRoles.length - visibleRoles.length,
                        0,
                    );

                    return (
                        <article
                            key={`${member.name}-${index}`}
                            className={styles.teamCard}
                        >
                            <div className={styles.teamImageFrame}>
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className={styles.teamIcon}
                                    style={{
                                        objectPosition: `${member.imagePosition ?? "center"} top`,
                                    }}
                                    loading="lazy"
                                />
                                <div className={styles.teamImageOverlay} />
                                {member.badge && (
                                    <span className={styles.teamBadge}>
                                        {member.badge}
                                    </span>
                                )}
                            </div>

                            <div className={styles.teamCardContent}>
                                <h3 className={styles.teamName}>
                                    {member.name}
                                </h3>
                                <span className={styles.role}>
                                    {member.role}
                                </span>

                                <div className={styles.teamMeta}>
                                    <span>{member.title}</span>
                                    <span className={styles.metaSeparator}>
                                        •
                                    </span>
                                    <span>{member.university}</span>
                                </div>

                                {additionalRoles.length > 0 && (
                                    <div className={styles.additionalRoles}>
                                        <span
                                            className={
                                                styles.additionalRolesLabel
                                            }
                                        >
                                            Also contributed as
                                        </span>
                                        <div className={styles.roleChips}>
                                            {visibleRoles.map(
                                                (additionalRole) => (
                                                    <span
                                                        key={`${member.name}-${additionalRole.name}`}
                                                        className={
                                                            additionalRole.type ===
                                                            "sprint"
                                                                ? styles.sprintRole
                                                                : styles.secondaryRole
                                                        }
                                                    >
                                                        {additionalRole.name}
                                                    </span>
                                                ),
                                            )}
                                            {remainingRoles > 0 && (
                                                <span
                                                    className={styles.moreRoles}
                                                >
                                                    +{remainingRoles}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {member.socials.length > 0 && (
                                    <div className={styles.teamSocials}>
                                        {member.socials.map((social, idx) => (
                                            <a
                                                key={idx}
                                                href={social.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${member.name} social link`}
                                            >
                                                <img src={social.icon} alt="" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
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
