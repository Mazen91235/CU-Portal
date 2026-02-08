import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../redux/Store";
export const DriveAPI = createApi({
    reducerPath: "driveAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://www.googleapis.com/upload/drive/v3",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.google_access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        uploadFileToDrive: builder.mutation<string, FormData>({
            query: (fileData) => ({
                url: "/files?uploadType=multipart",
                method: "POST",
                body: fileData,
            }),
            transformResponse: ({ id }: { id: string }) => id,
        }),
        makeFilePublic: builder.mutation<boolean, string>({
            query: (fileId) => ({
                url: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
                method: "POST",
                body: {
                    role: "reader",
                    type: "anyone",
                },
            }),
            transformResponse: () => true,
        }),
        getResumableSession: builder.mutation<
            string,
            {
                metadata: { name: string; mimeType: string; parents: string[] };
                fileType: string;
                fileSize: number;
            }
        >({
            query: ({ metadata, fileType, fileSize }) => ({
                url: `/files?uploadType=resumable`,
                method: "POST",
                body: metadata,
                headers: {
                    "X-Upload-Content-Type": fileType,
                    "X-Upload-Content-Length": fileSize.toString() || "0",
                },
            }),
            transformResponse: (_, meta) => {
                return meta?.response?.headers?.get("location") || "";
            },
        }),
        uploadChunk: builder.mutation<
            { status?: number; range?: string },
            {
                sessionUrl: string;
                chunk: Blob;
                start: number;
                end: number;
                total: number;
            }
        >({
            async queryFn(
                { sessionUrl, chunk, start, end, total },
                _api,
                _extraOptions,
                baseQuery,
            ) {
                const result = await baseQuery({
                    url: sessionUrl,
                    method: "PUT",
                    body: chunk,
                    headers: {
                        "Content-Range": `bytes ${start}-${end}/${total}`,
                        "Content-Type": "application/octet-stream",
                    },
                });

                if (result.error && result.error.status === 308) {
                    const response = result.meta?.response;
                    return {
                        data: {
                            status: 308,
                            range: response?.headers.get("Range") || "",
                        },
                    };
                }

                return result.error ? { error: result.error } : { data: {} };
            },
        }),
        finalizeUpload: builder.mutation<
            string,
            {
                sessionUrl: string;
                total: number;
            }
        >({
            query: ({ sessionUrl, total }) => ({
                url: sessionUrl,
                method: "PUT",
                body: {},
                headers: {
                    "Content-Range": `bytes */${total}`,
                },
            }),
            transformResponse: (response: { id: string }) => response.id,
        }),
        removeFileFromDrive: builder.mutation<boolean, string>({
            query: (fileId) => ({
                url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
                method: "DELETE",
            }),
            transformResponse: () => true,
        }),
    }),
});
export const {
    useUploadFileToDriveMutation,
    useMakeFilePublicMutation,
    useGetResumableSessionMutation,
    useUploadChunkMutation,
    useFinalizeUploadMutation,
    useRemoveFileFromDriveMutation,
} = DriveAPI;
