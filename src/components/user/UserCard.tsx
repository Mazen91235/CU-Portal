import { Link } from "react-router";
import type { UserResponseDto } from "../../types/dtos/UserDtos";
import { Avatar } from "../avatar/Avatar";
import { captitalize, formatString } from "../../utils/Formatter";
import emailIcon from "../../assets/icons/email.svg";
import phoneIcon from "../../assets/icons/phone.svg";
import styles from "./UserCard.module.css";

type UserCardProps = {
    user: UserResponseDto;
    button?: boolean;
};

export const UserCard = ({ user, button = false }: UserCardProps) => (
    <div className={styles.card}>
        <div className={styles.header}>
            <span className={styles.role}>{formatString(captitalize(user.role?.name || undefined), "CardTitle")}</span>
        </div>
        <Avatar user={user} size="large" className={styles.avatar} />
        <h3 className={styles.name}>{formatString(user.name, "CardTitle")}</h3>
        <div className={styles.academicDetails}>
            <div><span>Faculty</span><span>{formatString(user.faculty?.name || "N/A", "CardDescription")}</span></div>
            <div className={styles.separator}></div>
            <div><span>Department</span><span>{formatString(user.department?.name || "N/A", "CardDescription")}</span></div>
            <div className={styles.separator}></div>
            <div><span>Year</span><span>{user.year?.year || "N/A"}</span></div>
        </div>
        <div className={styles.details}>
            <h5><img src={emailIcon} alt="Email" /><span>{user.email}</span></h5>
            <h5><img src={phoneIcon} alt="Phone" /><span>{user.phone || "N/A"}</span></h5>
        </div>
        {button && <Link to={`/admin/users/${user.id}`} className={styles.viewButton}>View user profile</Link>}
    </div>
);