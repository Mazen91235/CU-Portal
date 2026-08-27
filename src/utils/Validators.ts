import type { UserResponseDto } from "../types/dtos/UserDtos";

export const validateUserLevel = (user: UserResponseDto | null | undefined) => {
    if (!user) return;
    if (
        !user?.faculty ||
        !user?.department ||
        !user?.year ||
        !user?.study_type
    ) {
        user.level = 1;
    } else if (!user?.status) {
        user.level = 2;
    } else if ((user.subjects?.length || 0) < 1) {
        user.level = 3;
    } else {
        user.level = 4;
    }
};

export const validateUserEarlyAccess = (
    user: UserResponseDto | null | undefined,
    permissions: string[] | null | undefined,
) => {
    if (!user || !permissions) return;
    if (user.is_early_access && !permissions.includes("Early Access")) {
        permissions.push("Early Access");
    }
};

export const validateUserCanAccessAll = (
    user: UserResponseDto | null | undefined,
    permissions: string[] | null | undefined,
) => {
    if (!user || !permissions) return;
    const accessPermissions = [
        "Access All Faculties",
        "Access All Departments",
        "Access All Years",
    ];
    if (accessPermissions.every((p) => permissions?.includes(p)))
        user.canAccessAll = true;
};

export const validateUserAccess = (
    level?: number | null,
    path?: string,
    roleLevel?: number | null,
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
