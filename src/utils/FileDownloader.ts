import { GetDriveDownloadUrl } from "./DriveManager";
import { GetUserApiLink } from "./LinkHandler";

export const downloadFile = (fileId: string): void => {
    // window.location.href = GetApiLink(`/files/${fileId}/download`);
    window.location.href = GetDriveDownloadUrl(fileId);
};

export const downloadMaterials = (materialIds: number[]): void => {
    if (materialIds.length === 0) return;
    const ids = materialIds.join(",");
    window.location.href = `${GetUserApiLink("/materials/download-many")}?material_ids=${ids}`;
};
