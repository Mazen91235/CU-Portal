export function GetDriveUrl(fileId: string) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function GetDriveIdFromUrl(url: string) {
    try {
        if (!url) return null;
        if (url.includes("id=")) {
            const urlObj = new URLSearchParams(url);
            return urlObj.get("id");
        }
        if (url.includes("/folders/")) {
            const fileId = url.split("/folders/")[1];
            return fileId.includes("?") ? fileId.split("?")[0] : fileId;
        }
        if (url.includes("/file/d/")) {
            const fileId = url.split("/file/d/")[1];
            return fileId.includes("/") ? fileId.split("/")[0] : fileId;
        }
        return null;
    } catch {
        // console.error("Error extracting Drive ID:", error);
        return null;
    }
}
