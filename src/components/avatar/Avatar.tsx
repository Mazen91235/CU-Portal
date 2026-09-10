import { useEffect, useMemo, useState } from "react";
import type { UserResponseDto } from "../../types/dtos/UserDtos";
import { GetAvatarLink } from "../../utils/LinkHandler";
import { GetDrivePreviewUrlFromUrl } from "../../utils/DriveManager";
import styles from "./Avatar.module.css";

type AvatarProps = {
    user?: UserResponseDto | null;
    url?: string;
    size: "small" | "medium" | "large";
    className?: string;
};

export const Avatar = ({ user, url, size, className }: AvatarProps) => {
    const candidates = useMemo(
        () =>
            [user?.avatar?.url, user?.google_avatar, url].filter(
                (value): value is string => Boolean(value?.trim()),
            ),
        [user?.avatar?.url, user?.google_avatar, url],
    );

    const candidateKey = candidates.join("\u0000");
    const [fallbackIndex, setFallbackIndex] = useState(0);

    useEffect(() => {
        setFallbackIndex(0);
    }, [candidateKey]);

    const currentSource = candidates[fallbackIndex] || "";
    const avatarSrc = GetAvatarLink(currentSource);
    const previewSrc = GetDrivePreviewUrlFromUrl(avatarSrc) || avatarSrc;

    const handleError = () => {
        setFallbackIndex((current) =>
            current + 1 < candidates.length ? current + 1 : current,
        );
    };

    const sizeClass =
        size === "small"
            ? styles.small
            : size === "medium"
              ? styles.medium
              : styles.large;

    return (
        <img
            src={previewSrc}
            alt={user?.name || "User"}
            className={`${styles.avatar} ${sizeClass} ${className || ""}`}
            onError={handleError}
        />
    );
};
