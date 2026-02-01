import { GetUserApiLink } from "./LinkHandler";
import { GetCookie } from "./CookiesManager";

export const downloadFile = async (fileId: string): Promise<string> => {
    const response = await fetch(GetUserApiLink(`/download/${fileId}`), {
        method: "GET",
        headers: {
            Authorization: `Bearer ${GetCookie("access_token")}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
};
