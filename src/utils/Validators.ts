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
