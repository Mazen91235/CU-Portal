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
import { GetDriveIdFromUrl, GetDriveUrl } from "../utils/DriveManager";
import type { Process } from "../types/Process";
import { GenerateRandomString } from "../utils/RandomGenerators";
import { setProcess } from "../services/redux/reducers/ProcessReducer";
import { showToast } from "../utils/ToastsManager";

export function useUploadFileToDriveChunked({
    resolve,
    reject,
}: {
    resolve?: (process: Process) => void;
    reject?: (process: Process) => void;
}) {
    const isGoogleAccessTokenLoading = useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token,
    );
    const [getResumableSession] = useGetResumableSessionMutation();
    const [uploadChunk] = useUploadChunkMutation();
    const [finalizeUpload] = useFinalizeUploadMutation();
    const [makeFilePublic] = useMakeFilePublicMutation();
    const dispatch = useAppDispatch();
    const uploadFileToDriveChunked = useCallback(
        async (
            file: File | null,
            processName: string,
            existingProcess?: Process,
        ) => {
            const process: Process =
                existingProcess ?? {
                    id: GenerateRandomString(16),
                    name: processName,
                    status: "processing",
                    progress: 0,
                };
            try {
                if (!google_access_token) {
                    const reason =
                        "Please Authenticate with Google First to Proceed.";
                    dispatch(
                        setProcess({
                            ...process,
                            status: "failed",
                            reason,
                        }),
                    );
                    return;
                }
                if (!file) {
                    dispatch(
                        setProcess({
                            ...process,
                            status: "failed",
                            reason: "No file selected",
                        }),
                    );
                    return;
                }
                const metadata = {
                    name: file.name,
                    mimeType: file.type,
                    parents: ["root"],
                };
                if (!existingProcess) {
                    dispatch(setProcess(process));
                }
                const resumableSessionURL = await getResumableSession({
                    metadata,
                    fileType: file.type,
                    fileSize: file.size,
                }).unwrap();
                dispatch(
                    setProcess({ ...process, status: "pending", progress: 0 }),
                );
                const chunkSize = 5 * 1024 * 1024; // 5MB
                let start = 0;
                let end = 0;
                while (start < (file?.size || 0)) {
                    end = Math.min(start + chunkSize, file?.size || 0);
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
                    } else {
                        start = end;
                    }
                    dispatch(
                        setProcess({
                            ...process,
                            status: "pending",
                            progress: Math.round(
                                (start / (file?.size || 1)) * 100,
                            ),
                        }),
                    );
                }
                const uploadedFileId = await finalizeUpload({
                    sessionUrl: resumableSessionURL!,
                    total: file?.size || 0,
                }).unwrap();
                dispatch(
                    setProcess({
                        ...process,
                        progress: 100,
                        status: "processing",
                    }),
                );
                await makeFilePublic(uploadedFileId!).unwrap();
                const url = GetDriveUrl(uploadedFileId!);
                dispatch(setProcess({ ...process, url: url }));
                if (resolve) resolve({ ...process, url: url });
                return { ...process, url: url };
            } catch (error) {
                const res = (error as Error).message || "Failed to Upload File";
                dispatch(
                    setProcess({ ...process, status: "failed", reason: res }),
                );
                if (reject)
                    reject({ ...process, status: "failed", reason: res });
                throw new Error(res);
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
    return Object.assign(uploadFileToDriveChunked, {
        isGoogleAccessTokenLoading,
    });
}

export const useCreateProcess = ({
    resolve,
    reject,
}: {
    resolve?: (process: Process) => void;
    reject?: (process: Process) => void;
}) => {
    const dispatch = useAppDispatch();
    const createProcess = useCallback(
        async (name: string) => {
            const process: Process = {
                id: GenerateRandomString(16),
                name,
                status: "processing",
                progress: 0,
            };
            try {
                dispatch(setProcess(process));
                if (resolve) resolve(process);
                return process;
            } catch (error) {
                const res = (error as Error).message || "An error occurred";
                dispatch(
                    setProcess({ ...process, status: "failed", reason: res }),
                );
                if (reject)
                    reject({ ...process, status: "failed", reason: res });
            }
            return process;
        },
        [dispatch, resolve, reject],
    );
    return createProcess;
};

export function useUploadFileToDrive({
    resolve,
    reject,
}: {
    resolve?: (url: string) => void;
    reject?: (error: string) => void;
}) {
    const isGoogleAccessTokenLoading = useGetGoogleAccessToken();
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
    return Object.assign(uploadFileToDrive, {
        isGoogleAccessTokenLoading,
    });
}

export function useRemoveUploadedFiles() {
    const removeFileFromDrive = useRemoveFileFromDrive({});

    return useCallback(
        async (fileUrls: string[]) => {
            const uniqueIds = [
                ...new Set(
                    fileUrls
                        .map((url) => GetDriveIdFromUrl(url))
                        .filter((id): id is string => Boolean(id)),
                ),
            ];

            await Promise.allSettled(
                uniqueIds.map((fileId) => removeFileFromDrive(fileId)),
            );
        },
        [removeFileFromDrive],
    );
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
