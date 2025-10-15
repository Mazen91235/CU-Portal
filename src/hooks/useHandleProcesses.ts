import { useEffect, useMemo } from "react";
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

export default function useUploadFileToDriveChunked(
    file: File,
    processName: string,
    resolve?: (url: string) => void,
    reject?: (error: string) => void
) {
    useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token
    );
    const [getResumableSession] = useGetResumableSessionMutation();
    const [uploadChunk] = useUploadChunkMutation();
    const [finalizeUpload] = useFinalizeUploadMutation();
    const [makeFilePublic] = useMakeFilePublicMutation();
    const dispatch = useAppDispatch();
    const metadata = useMemo(
        () => ({
            name: file.name,
            mimeType: file.type,
            parents: ["root"],
        }),
        [file]
    );
    const process: Process = useMemo(
        () => ({
            id: GenerateRandomString(16),
            name: processName,
            status: "pending",
            progress: 0,
        }),
        [processName]
    );
    useEffect(() => {
        if (!google_access_token) return;
        (async () => {
            dispatch(setProcess(process));
            const { data: resumableSessionURL, error: resumableSessionError } =
                await getResumableSession({ metadata, file });
            if (resumableSessionError) {
                process.status = "failed";
                process.reason = resumableSessionError
                    ? JSON.stringify(resumableSessionError)
                    : "Failed to Upload File";
                dispatch(setProcess(process));
                if (reject) reject("Failed to Upload File");
                return;
            }
            process.status = "in_progress";
            dispatch(setProcess(process));
            const chunkSize = 5 * 1024 * 1024; // 5MB
            let start = 0;
            let end = Math.min(start + chunkSize, file.size);
            while (start < file.size) {
                const chunk = file.slice(start, end);
                const { data: uploadChunkResponse, error: uploadChunkError } =
                    await uploadChunk({
                        sessionUrl: resumableSessionURL!,
                        chunk,
                        start,
                        end: end - 1,
                        total: file.size,
                    });
                if (uploadChunkError) {
                    process.status = "failed";
                    process.reason = uploadChunkError
                        ? JSON.stringify(uploadChunkError)
                        : "Failed to Upload File";
                    dispatch(setProcess(process));
                    if (reject) reject("Failed to Upload File");
                    return;
                }
                const range = uploadChunkResponse?.range;
                if (uploadChunkResponse?.status == 308 && range) {
                    const bytesUploaded = parseInt(range.split("-")[1]) + 1;
                    start = bytesUploaded;
                    continue;
                }
                start = end;
                end = Math.min(start + chunkSize, file.size);
                process.progress = Math.round((start / file.size) * 100);
                dispatch(setProcess(process));
            }
            const { data: uploadedFileId, error: finalizeUploadError } =
                await finalizeUpload({
                    sessionUrl: resumableSessionURL!,
                    total: file.size,
                });
            if (finalizeUploadError) {
                process.status = "failed";
                process.reason = finalizeUploadError
                    ? JSON.stringify(finalizeUploadError)
                    : "Failed to Upload File";
                dispatch(setProcess(process));
                if (reject) reject("Failed to Upload File");
                return;
            }
            process.progress = 100;
            process.status = "pending";
            dispatch(setProcess(process));
            const { error: makeFilePublicError } = await makeFilePublic(
                uploadedFileId!
            );
            if (makeFilePublicError) {
                process.status = "failed";
                process.reason = makeFilePublicError
                    ? JSON.stringify(makeFilePublicError)
                    : "Failed to Upload File";
                dispatch(setProcess(process));
                if (reject) reject("Failed to Upload File");
                return;
            }
            const url = GetDriveUrl(uploadedFileId!);
            process.status = "completed";
            process.url = url;
            dispatch(setProcess(process));
            if (resolve) resolve(url);
        })();
    }, [
        file,
        google_access_token,
        metadata,
        process,
        resolve,
        reject,
        getResumableSession,
        uploadChunk,
        finalizeUpload,
        makeFilePublic,
        dispatch,
    ]);
}

export function useUploadFileToDrive(
    file: File,
    resolve?: (url: string) => void,
    reject?: (error: string) => void
) {
    useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token
    );
    const [uploadFileToDrive] = useUploadFileToDriveMutation();
    const [makeFilePublic] = useMakeFilePublicMutation();
    const metadata = useMemo(
        () => ({
            name: file.name,
            mimeType: file.type,
            parents: ["root"],
        }),
        [file]
    );
    const formData = useMemo(() => {
        const formData = new FormData();
        const metadataBlob = new Blob([JSON.stringify(metadata)], {
            type: "application/json",
        });
        formData.append("metadata", metadataBlob);
        formData.append("file", file);
        return formData;
    }, [file, metadata]);
    useEffect(() => {
        if (!google_access_token) return;
        (async () => {
            const { data: uploadedFileId, error: uploadError } =
                await uploadFileToDrive(formData);
            if (uploadError) {
                if (reject) reject("Failed to Upload File");
                return;
            }
            const { error: makeFilePublicError } = await makeFilePublic(
                uploadedFileId!
            );
            if (makeFilePublicError) {
                if (reject) reject("Failed to Upload File");
                return;
            }
            const url = GetDriveUrl(uploadedFileId!);
            if (resolve) resolve(url);
        })();
    }, [
        file,
        google_access_token,
        formData,
        resolve,
        reject,
        uploadFileToDrive,
        makeFilePublic,
    ]);
}

export function useRemoveFileFromDrive(
    fileId: string,
    resolve?: () => void,
    reject?: (error: string) => void
) {
    useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token
    );
    const [removeFileFromDrive] = useRemoveFileFromDriveMutation();

    useEffect(() => {
        if (!google_access_token) return;
        (async () => {
            const { error: removeError } = await removeFileFromDrive(fileId);
            if (removeError) {
                if (reject) reject("Failed to Remove File");
                return;
            }
            if (resolve) resolve();
        })();
    }, [fileId, google_access_token, resolve, reject, removeFileFromDrive]);
}
