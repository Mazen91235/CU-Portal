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
    return path.replace("/uc?export=view&id=", "/thumbnail?sz=1000&id=");
};

export const GetImgFromLink = async (path: string): Promise<File> => {
    if (!path || path.trim() == "") {
        // return a default avatar as File
        const response = await fetch(DefaultAvatar);
        const blob = await response.blob();
        return new File([blob], "default-avatar.png", { type: blob.type });
    }
    if (path.startsWith("/")) {
        const response = await fetch(GetWebLink(path));
        const blob = await response.blob();
        return new File([blob], "avatar.png", { type: blob.type });
    }
    const response = await fetch(path);
    const blob = await response.blob();
    return new File([blob], "avatar.png", { type: blob.type });
};
