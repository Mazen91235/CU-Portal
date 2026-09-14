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
    const founders = teamMembers.filter(
        (m) => m.badge === "Founder & Team Lead" || m.badge === "Founder",
    );

    const partners = teamMembers.filter(
        (m) => m.badge === "Partner" || m.badge === "Contributor",
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

    const renderTeamCard = (member: MemberProps, index: number) => (
        <div key={index} className={styles.teamCard}>
            {member.badge && (
                <div>
                    <span className={styles.teamBadge}>{member.badge}</span>
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

            {(founders.includes(member) || partners.includes(member)) && (
                <span className={styles.role}>{member.role}</span>
            )}
            <div className={styles.teamRole}>
                {member.title}
                <br />
                {member.university}
            </div>

            {member.socials && member.socials.length > 0 && (
                <div className={styles.teamSocials}>
                    {member.socials.map((social: SocialLink, idx: number) => (
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
    );

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
