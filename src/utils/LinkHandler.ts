import DefaultAvatar from "../assets/default avatar.png";
const domain = "https://cu-portal.com";
const version = "v1";
export const GetUserApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/${version}/user/${path}`;
};

export const GetAdminApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/${version}/admin/${path}`;
};

export const GetApiLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/api/${version}/${path}`;
};

export const GetWebLink = (path: string): string => {
    if (path.startsWith("/")) {
        path = path.substring(1);
    }
    return `${domain}/${path}`;
};

export const GetAvatarLink = (path: string): string => {
    if (!path || path.trim() == "") return DefaultAvatar;
    if (path.startsWith("/")) return GetWebLink(path);
    return path;
};
