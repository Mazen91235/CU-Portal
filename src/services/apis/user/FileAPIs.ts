import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { FileSearchDto } from "../../../types/dtos/FileDTOs";
export const FileAPI = createApi({
    reducerPath: "fileAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink(""),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        downloadFile: builder.query<
            MediaStream,
            FileSearchDto
        >({
            query: ({ file_id }) => ({
                url: `/download/${file_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyDownloadFileQuery } = FileAPI;
