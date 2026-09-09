import { useMemo } from "react";
import { Layout } from "../../components/layout/Layout";
import { PageSeo } from "../../components/PageSeo";
import { Banner } from "../../components/banner/Banner";
import { teamMembers } from "../../data/TeamData";
import { TeamSection } from "../../components/landing/TeamSection";
import styles from "./TeamPage.module.css";

export const TeamPage = () => {
    const founders = teamMembers.filter(
        (m) => m.badge === "Founder & Team Lead" || m.badge === "Founder"
    );

    const contributors = teamMembers.filter(
        (m) => m.badge === "Contributor" || m.badge === "Contributer"
    );

    const groupedMembers = useMemo(() => {
        return teamMembers.reduce((acc, member) => {
            const group = member.roleTitle || "Other";
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(member);
            return acc;
        }, {} as Record<string, typeof teamMembers>);
    }, []);

    const categoriesToRender = [
        "Full Stack Developer",
        "Backend Developer",
        "Frontend Developer",
        "UI/UX Designer",
    ];
    
    Object.keys(groupedMembers).forEach((role) => {
        if (!categoriesToRender.includes(role)) {
            categoriesToRender.push(role);
        }
    });

    const renderTeamCard = (member: any, index: number) => (
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
            
            <div className={styles.teamRole}>
                {member.role}
                <br />
                {member.university}
            </div>

            {member.socials && member.socials.length > 0 && (
                <div className={styles.teamSocials}>
                    {member.socials.map((social: any, idx: number) => (
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
        <Layout>
            <PageSeo
                title="Our Team - CU Portal"
                description="Meet the brilliant minds and contributors behind CU Portal."
            />
            <Banner
                title="Our Team"
                description="Meet the brilliant minds and contributors behind CU Portal"
            />

            <div className={styles.container}>
                {founders.length > 0 && (
                    <TeamSection
                        title="Founder"
                        members={founders}
                        renderCard={renderTeamCard}
                    />
                )}

                {contributors.length > 0 && (
                    <TeamSection
                        title="Contributor"
                        members={contributors}
                        renderCard={renderTeamCard}
                    />
                )}

                {categoriesToRender.map((roleTitle) => {
                    const members = groupedMembers[roleTitle] || [];
                    return (
                        <TeamSection
                            key={roleTitle}
                            title={roleTitle}
                            members={members}
                            renderCard={renderTeamCard}
                        />
                    );
                })}
            </div>
        </Layout>
    );
};