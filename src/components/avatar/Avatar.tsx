import type { User } from "../../types/entities/User";
import { GetAvatarLink } from "../../utils/LinkHandler";
import styles from "./Avatar.module.css";

type AvatarProps = {
    user?: User | null;
    url?: string;
    size: "small" | "medium" | "large";
};

export const Avatar = ({ user, url, size }: AvatarProps) => {
    const avatarSrc = GetAvatarLink(
        user?.details?.avatar || user?.google_avatar || url || "",
    );

    const sizeClass =
        size === "small"
            ? styles.small
            : size === "medium"
              ? styles.medium
              : styles.large;

    return (
        <img
            src={avatarSrc}
            alt={user?.name || "User"}
            className={`${styles.avatar} ${sizeClass}`}
        />
    );
};
