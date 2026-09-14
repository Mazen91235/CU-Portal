import styles from "../../pages/landing/TeamPage.module.css";
interface TeamSectionProps {
    title: string;
    members: any[];
    renderCard: (member: any, index: number) => React.ReactNode;
}

export const TeamSection = ({ title, members, renderCard }: TeamSectionProps) => {
    if (members.length === 0 && title !== "Backend Developer") {
        return null;
    }

    return (
        <section className={styles.roleSection}>
            <h3 className={styles.roleCategoryTitle}>{title}</h3>
            <div className={styles.teamMembers}>
                {members.map((member, index) => renderCard(member, index))}
            </div>
        </section>
    );
};
