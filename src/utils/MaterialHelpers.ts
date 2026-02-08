import folderIcon from "../assets/icons/file-icon-folder.svg";
import imageIcon from "../assets/icons/file-icon-image.svg";
import videoIcon from "../assets/icons/file-icon-video.svg";
import audioIcon from "../assets/icons/file-icon-audio.svg";
import pdfIcon from "../assets/icons/file-icon-pdf.svg";
import wordIcon from "../assets/icons/file-icon-word.svg";
import excelIcon from "../assets/icons/file-icon-excel.svg";
import powerpointIcon from "../assets/icons/file-icon-powerpoint.svg";
import txtIcon from "../assets/icons/file-icon-txt.svg";
import archiveIcon from "../assets/icons/file-icon-archive.svg";
import driveIcon from "../assets/icons/file-icon-drive.svg";
import youtubeIcon from "../assets/icons/file-icon-youtube.svg";
import externalIcon from "../assets/icons/file-icon-external.svg";
import unknownIcon from "../assets/icons/file-icon-unknown.svg";

export const getFileIcon = (fileType?: string): string => {
    switch (fileType?.toLowerCase()) {
        case "folder":
            return folderIcon;
        case "image":
            return imageIcon;
        case "video":
            return videoIcon;
        case "audio":
            return audioIcon;
        case "pdf":
            return pdfIcon;
        case "doc":
        case "docx":
            return wordIcon;
        case "sheet":
        case "xls":
        case "xlsx":
            return excelIcon;
        case "ppt":
        case "pptx":
            return powerpointIcon;
        case "text":
        case "txt":
            return txtIcon;
        case "archive":
        case "zip":
        case "rar":
            return archiveIcon;
        case "gdrive":
        case "drive":
            return driveIcon;
        case "youtube":
            return youtubeIcon;
        case "external":
            return externalIcon;
        default:
            return unknownIcon;
    }
};

export const getDownloadName = (
    fileName?: string,
    realFileName?: string,
    mimeType?: string,
): string => {
    if (!fileName) return realFileName || "download";

    const mimeToExt: Record<string, string> = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/bmp": ".bmp",
        "image/svg+xml": ".svg",
        "image/tiff": ".tiff",
        "image/heic": ".heic",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            ".docx",
        "application/vnd.google-apps.document": ".docx",
        "application/vnd.ms-excel": ".xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            ".xlsx",
        "application/vnd.google-apps.spreadsheet": ".xlsx",
        "application/vnd.ms-powerpoint": ".ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
            ".pptx",
        "application/vnd.google-apps.presentation": ".pptx",
        "application/pdf": ".pdf",
        "video/mp4": ".mp4",
        "video/mpeg": ".mpeg",
        "video/quicktime": ".mov",
        "video/x-msvideo": ".avi",
        "video/x-ms-wmv": ".wmv",
        "video/webm": ".webm",
        "video/ogg": ".ogv",
        "video/3gpp": ".3gp",
        "video/3gpp2": ".3g2",
        "audio/mpeg": ".mp3",
        "audio/mp3": ".mp3",
        "audio/wav": ".wav",
        "audio/ogg": ".ogg",
        "audio/aac": ".aac",
        "audio/flac": ".flac",
        "audio/webm": ".weba",
        "audio/3gpp": ".3gp",
        "text/plain": ".txt",
        "text/csv": ".csv",
        "text/html": ".html",
        "text/css": ".css",
        "text/javascript": ".js",
        "application/json": ".json",
        "application/xml": ".xml",
        "application/zip": ".zip",
        "application/x-rar-compressed": ".rar",
        "application/x-7z-compressed": ".7z",
        "application/gzip": ".gz",
        "application/x-tar": ".tar",
        "application/x-bzip2": ".bz2",
    };

    const ext = mimeType ? mimeToExt[mimeType.toLowerCase()] : undefined;
    return ext ? `${fileName}${ext}` : realFileName || fileName;
};
