import type { User } from "../types/entities/User";

export const validateUserLevel = (user: User | null | undefined) => {
    if (!user) return 1;
    if (
        !user?.faculty ||
        !user?.department ||
        !user?.year ||
        !user?.type ||
        user?.type === ""
    ) {
        return 1;
    } else if (!user?.status) {
        return 2;
    } else if ((user.enrolled_courses_count || 0) < 1) {
        return 3;
    } else {
        return 4;
    }
};
export const validateUserAccess = (
    level?: number,
    path?: string,
    roleLevel?: number,
) => {
    if ((level || 4) > 3 || ((level || 4) > 2 && (roleLevel || 4) < 3))
        return true;
    const allowedPaths = [
        [],
        ["/user", "/user/settings/profile", "/user/settings/academic"],
        ["/user", "/user/settings/profile", "/user/settings/academic"],
        [
            "/user",
            "/user/settings/profile",
            "/user/settings/academic",
            "/user/settings/courses",
        ],
        [],
    ];
    const currentAllowedPaths = allowedPaths[level || 4] || [];
    return currentAllowedPaths.some((p) => p === path);
};

export const validateCachedData = (
    timestamp?: number,
    validityDurationInMinutes: number = 15,
) => {
    if (!timestamp) return false;
    return Date.now() - timestamp < validityDurationInMinutes * 60 * 1000;
};
