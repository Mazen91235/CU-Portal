import { useCallback, useEffect, useMemo, useState } from "react";
import type { UserResponseDto } from "../../types/dtos/UserDtos";
import { GetAvatarLink } from "../../utils/LinkHandler";
import styles from "./Avatar.module.css";

type AvatarProps = {
    user?: UserResponseDto | null;
    url?: string;
    size: "small" | "medium" | "large";
    className?: string;
};

export const Avatar = ({ user, url, size, className }: AvatarProps) => {
    const links = useMemo(() => {
        const links = [user?.avatar?.url, user?.google_avatar, url].filter(
            Boolean,
        ) as string[];
        links.push("");
        return links;
    }, [user, url]);
    const handleError = useCallback(() => {
        if (links.length === 0) return;
        const link = links.shift();
        setAvatarSrc(GetAvatarLink(link || ""));
    }, [links]);
    const [avatarSrc, setAvatarSrc] = useState(GetAvatarLink(""));
    useEffect(() => {
        handleError();
    }, [handleError]);

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
            className={`${styles.avatar} ${sizeClass} ${className || ""}`}
            onError={handleError}
        />
    );
};
