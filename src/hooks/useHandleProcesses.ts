import { useCallback } from "react";
import {
    useGetResumableSessionMutation,
    useUploadChunkMutation,
    useFinalizeUploadMutation,
    useMakeFilePublicMutation,
    useUploadFileToDriveMutation,
    useRemoveFileFromDriveMutation,
} from "../services/apis/DriveAPIs";
import { useAppDispatch, useAppSelector } from "../services/redux/Hooks";
import { useGetGoogleAccessToken } from "./useAuth";
import { GetDriveUrl } from "../utils/DriveManager";
import type { Process } from "../types/Process";
import { GenerateRandomString } from "../utils/RandomGenerators";
import { setProcess } from "../services/redux/reducers/ProcessReducer";
import { showToast } from "../utils/ToastsManager";

export default function useUploadFileToDriveChunked({
    resolve,
    reject,
}: {
    resolve?: (url: string) => void;
    reject?: (error: string) => void;
}) {
    useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token,
    );
    const [getResumableSession] = useGetResumableSessionMutation();
    const [uploadChunk] = useUploadChunkMutation();
    const [finalizeUpload] = useFinalizeUploadMutation();
    const [makeFilePublic] = useMakeFilePublicMutation();
    const dispatch = useAppDispatch();
    const uploadFileToDriveChunked = useCallback(
        async (file: File | null, processName: string) => {
            const process: Process = {
                id: GenerateRandomString(16),
                name: processName,
                status: "pending",
                progress: 0,
            };
            try {
                if (!google_access_token) {
                    showToast(
                        "error",
                        "Error",
                        "Please Authenticate with Google First to Proceed.",
                    );
                    return;
                }
                if (!file) return;
                const metadata = {
                    name: file.name,
                    mimeType: file.type,
                    parents: ["root"],
                };
                dispatch(setProcess(process));
                const resumableSessionURL = await getResumableSession({
                    metadata,
                    file,
                }).unwrap();
                process.status = "in_progress";
                dispatch(setProcess(process));
                const chunkSize = 5 * 1024 * 1024; // 5MB
                let start = 0;
                let end = Math.min(start + chunkSize, file?.size || 0);
                while (start < (file?.size || 0)) {
                    const chunk = file?.slice(start, end);
                    if (!chunk) break;
                    const uploadChunkResponse = await uploadChunk({
                        sessionUrl: resumableSessionURL!,
                        chunk,
                        start,
                        end: end - 1,
                        total: file?.size || 0,
                    }).unwrap();
                    const range = uploadChunkResponse?.range;
                    if (uploadChunkResponse?.status == 308 && range) {
                        const bytesUploaded = parseInt(range.split("-")[1]) + 1;
                        start = bytesUploaded;
                        continue;
                    }
                    start = end;
                    end = Math.min(start + chunkSize, file?.size || 0);
                    process.progress = Math.round(
                        (start / (file?.size || 1)) * 100,
                    );
                    dispatch(setProcess(process));
                }
                const uploadedFileId = await finalizeUpload({
                    sessionUrl: resumableSessionURL!,
                    total: file?.size || 0,
                }).unwrap();
                process.progress = 100;
                process.status = "pending";
                dispatch(setProcess(process));
                await makeFilePublic(uploadedFileId!).unwrap();
                const url = GetDriveUrl(uploadedFileId!);
                process.status = "completed";
                process.url = url;
                dispatch(setProcess(process));
                if (resolve) resolve(url);
                return url;
            } catch {
                process.status = "failed";
                process.reason = "Failed to Upload File";
                dispatch(setProcess(process));
                if (reject) reject("Failed to Upload File");
                throw new Error("Failed to Upload File");
            }
        },
        [
            google_access_token,
            resolve,
            reject,
            getResumableSession,
            uploadChunk,
            finalizeUpload,
            makeFilePublic,
            dispatch,
        ],
    );
    return uploadFileToDriveChunked;
}

export function useUploadFileToDrive({
    resolve,
    reject,
}: {
    resolve?: (url: string) => void;
    reject?: (error: string) => void;
}) {
    useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token,
    );
    const [uploadFileToDriveMutation] = useUploadFileToDriveMutation();
    const [makeFilePublic] = useMakeFilePublicMutation();
    const uploadFileToDrive = useCallback(
        async (file: File | null) => {
            try {
                if (!google_access_token) {
                    showToast(
                        "error",
                        "Error",
                        "Please Authenticate with Google First to Proceed.",
                    );
                    return;
                }
                if (!file) return;
                const metadata = {
                    name: file.name,
                    mimeType: file.type,
                    parents: ["root"],
                };
                const formData = new FormData();
                const metadataBlob = new Blob([JSON.stringify(metadata)], {
                    type: "application/json",
                });
                formData.append("metadata", metadataBlob);
                formData.append("file", file);
                const uploadedFileId =
                    await uploadFileToDriveMutation(formData).unwrap();
                await makeFilePublic(uploadedFileId!).unwrap();
                const url = GetDriveUrl(uploadedFileId!);
                if (resolve) resolve(url);
                return url;
            } catch {
                if (reject) reject("Failed to Upload File");
                throw new Error("Failed to Upload File");
            }
        },
        [
            google_access_token,
            resolve,
            reject,
            uploadFileToDriveMutation,
            makeFilePublic,
        ],
    );
    return uploadFileToDrive;
}

export function useRemoveFileFromDrive({
    resolve,
    reject,
}: {
    resolve?: () => void;
    reject?: (error: string) => void;
}) {
    useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token,
    );
    const [removeFileFromDriveMutation] = useRemoveFileFromDriveMutation();

    const removeFileFromDrive = useCallback(
        async (fileId: string) => {
            try {
                if (!google_access_token) {
                    showToast(
                        "error",
                        "Error",
                        "Please Authenticate with Google First to Proceed.",
                    );
                    return;
                }
                await removeFileFromDriveMutation(fileId).unwrap();
                if (resolve) resolve();
            } catch {
                if (reject) reject("Failed to Remove File");
                throw new Error("Failed to Remove File");
            }
        },
        [google_access_token, resolve, reject, removeFileFromDriveMutation],
    );
    return removeFileFromDrive;
}
