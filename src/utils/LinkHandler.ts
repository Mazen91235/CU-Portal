const domain = "https://cu-portal.com";

export const GetUserApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/user/${path}`;
};

export const GetAdminApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/admin/${path}`;
};

export const GetApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/${path}`;
};

export const GetWebLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/${path}`;
};
