import { type MemberProps } from "../../types/props/MemberProps";
import styles from "../../pages/landing/TeamPage.module.css";
interface TeamSectionProps {
    title: string;
    members: MemberProps[];
    renderCard: (member: MemberProps, index: number) => React.ReactNode;
}

export const TeamSection = ({
    title,
    members,
    renderCard,
}: TeamSectionProps) => {
    if (members.length === 0) {
        return null;
    }

    return (
        <section className={styles.roleSection}>
            <h3 className={styles.roleCategoryTitle}>
                {title}
                {title.charAt(title.length - 1) == "s" ? "" : "s"}
            </h3>
            <div className={styles.teamMembers}>
                {members.map((member, index) => renderCard(member, index))}
            </div>
        </section>
    );
};
