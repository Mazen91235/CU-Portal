import { useMemo, useState } from "react";
import { PageSeo } from "../../components/PageSeo";
import { Banner } from "../../components/banner/Banner";
import { Header } from "../../components/landing/Header";
import { Footer } from "../../components/landing/Footer";
import { teamMembers } from "../../data/TeamData";
import { TeamSection } from "../../components/landing/TeamSection";
import {
    type MemberProps,
    type SocialLink,
    memberRoles,
} from "../../types/props/MemberProps";
import styles from "./TeamPage.module.css";

export const TeamPage = () => {
    const [, setActiveSection] = useState("team");
    const founders = teamMembers.filter((m) =>
        m.badge?.toLocaleLowerCase().includes("founder"),
    );

    const partners = teamMembers.filter((m) =>
        m.badge?.toLocaleLowerCase().includes("partner"),
    );

    const groupedMembers = useMemo(() => {
        return teamMembers.reduce(
            (acc, member) => {
                const group = member.role || "Other";
                if (!acc[group]) {
                    acc[group] = [];
                }
                acc[group].push(member);
                return acc;
            },
            {} as Record<MemberProps["role"], typeof teamMembers>,
        );
    }, []);

    const renderTeamCard = (member: MemberProps, index: number) => {
        const additionalRoles = member.additionalRoles ?? [];
        const visibleRoles = additionalRoles.slice(0, 3);
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
                            objectPosition: `center ${member.imagePosition ?? "top"}`,
                        }}
                        loading="lazy"
                    />

                    <div className={styles.teamImageOverlay} />

                    {member.badge && (
                        <span className={styles.teamBadge}>{member.badge}</span>
                    )}
                </div>

                <div className={styles.teamCardContent}>
                    <div className={styles.teamNameBlock}>
                        <h3 className={styles.teamName}>{member.name}</h3>
                        <span className={styles.role}>{member.role}</span>
                    </div>

                    <div className={styles.teamMeta}>
                        <span>{member.title}</span>
                        <span className={styles.metaSeparator}>•</span>
                        <span>{member.university}</span>
                    </div>

                    {additionalRoles.length > 0 && (
                        <div className={styles.additionalRoles}>
                            <span className={styles.additionalRolesLabel}>
                                Also contributed as
                            </span>
                            <div className={styles.roleChips}>
                                {visibleRoles.map((additionalRole) => (
                                    <span
                                        key={`${member.name}-${additionalRole.name}`}
                                        className={
                                            additionalRole.type === "sprint"
                                                ? styles.sprintRole
                                                : styles.secondaryRole
                                        }
                                    >
                                        {additionalRole.name}
                                    </span>
                                ))}
                                {remainingRoles > 0 && (
                                    <span className={styles.moreRoles}>
                                        +{remainingRoles}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {member.socials && member.socials.length > 0 && (
                        <div className={styles.teamSocials}>
                            {member.socials.map(
                                (social: SocialLink, idx: number) => (
                                    <a
                                        key={idx}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${member.name} social link`}
                                    >
                                        <img src={social.icon} alt="" />
                                    </a>
                                ),
                            )}
                        </div>
                    )}
                </div>
            </article>
        );
    };

    return (
        <>
            <PageSeo
                title="Our Team - CUPortal"
                description="Meet the brilliant minds and contributors behind CU-Portal."
            />
            <div className={styles.teamPage}>
                <Header
                    activeSection="team"
                    setActiveSection={setActiveSection}
                    variant="team"
                />
                <Banner
                    title="Our Team"
                    description="Meet the brilliant minds and contributors behind CU-Portal"
                />

                <div className={styles.container}>
                    {founders.length > 0 && (
                        <TeamSection
                            title="Founders"
                            members={founders}
                            renderCard={renderTeamCard}
                        />
                    )}

                    {partners.length > 0 && (
                        <TeamSection
                            title="Partners"
                            members={partners}
                            renderCard={renderTeamCard}
                        />
                    )}

                    {Object.keys(groupedMembers).map((role, idx) => {
                        const members =
                            groupedMembers[
                                role as (typeof memberRoles)[number]
                            ] || [];
                        return (
                            <TeamSection
                                key={`${role}-${idx}`}
                                title={role}
                                members={members.filter(
                                    (member) =>
                                        !founders.includes(member) &&
                                        !partners.includes(member),
                                )}
                                renderCard={renderTeamCard}
                            />
                        );
                    })}
                </div>
                <Footer compact />
            </div>
        </>
    );
};
