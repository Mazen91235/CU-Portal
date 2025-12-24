import { useCallback, useMemo } from "react";
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

export default function useUploadFileToDriveChunked({
    file,
    processName,
    resolve,
    reject,
}: {
    file: File;
    processName: string;
    resolve?: (url: string) => void;
    reject?: (error: string) => void;
}) {
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
    const uploadFileToDriveChunked = useCallback(async () => {
        try {
            if (!google_access_token) return;
            dispatch(setProcess(process));
            const resumableSessionURL = await getResumableSession({
                metadata,
                file,
            }).unwrap();
            process.status = "in_progress";
            dispatch(setProcess(process));
            const chunkSize = 5 * 1024 * 1024; // 5MB
            let start = 0;
            let end = Math.min(start + chunkSize, file.size);
            while (start < file.size) {
                const chunk = file.slice(start, end);
                const uploadChunkResponse = await uploadChunk({
                    sessionUrl: resumableSessionURL!,
                    chunk,
                    start,
                    end: end - 1,
                    total: file.size,
                }).unwrap();
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
            const uploadedFileId = await finalizeUpload({
                sessionUrl: resumableSessionURL!,
                total: file.size,
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
        } catch {
            process.status = "failed";
            process.reason = "Failed to Upload File";
            dispatch(setProcess(process));
            if (reject) reject("Failed to Upload File");
            return;
        }
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
    return uploadFileToDriveChunked;
}

export function useUploadFileToDrive({
    file,
    resolve,
    reject,
}: {
    file: File;
    resolve?: (url: string) => void;
    reject?: (error: string) => void;
}) {
    useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token
    );
    const [uploadFileToDriveMutation] = useUploadFileToDriveMutation();
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
    const uploadFileToDrive = useCallback(async () => {
        try {
            if (!google_access_token) return;
            const uploadedFileId = await uploadFileToDriveMutation(
                formData
            ).unwrap();
            await makeFilePublic(uploadedFileId!).unwrap();
            const url = GetDriveUrl(uploadedFileId!);
            if (resolve) resolve(url);
        } catch {
            if (reject) reject("Failed to Upload File");
            return;
        }
    }, [
        google_access_token,
        formData,
        resolve,
        reject,
        uploadFileToDriveMutation,
        makeFilePublic,
    ]);
    return uploadFileToDrive;
}

export function useRemoveFileFromDrive({
    fileId,
    resolve,
    reject,
}: {
    fileId: string;
    resolve?: () => void;
    reject?: (error: string) => void;
}) {
    useGetGoogleAccessToken();
    const google_access_token = useAppSelector(
        (state) => state.user.google_access_token
    );
    const [removeFileFromDriveMutation] = useRemoveFileFromDriveMutation();

    const removeFileFromDrive = useCallback(async () => {
        try {
            if (!google_access_token) return;
            await removeFileFromDriveMutation(fileId).unwrap();
            if (resolve) resolve();
        } catch {
            if (reject) reject("Failed to Remove File");
            return;
        }
    }, [
        fileId,
        google_access_token,
        resolve,
        reject,
        removeFileFromDriveMutation,
    ]);
    return removeFileFromDrive;
}
