import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    AnnouncementCreateDto,
    AnnouncementResponseDto,
    AnnouncementSearchDto,
    AnnouncementUpdateDto,
} from "../../../types/dtos/AnnouncementDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminAnnouncementAPI = createApi({
    reducerPath: "adminAnnouncementAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/announcements"),
            timeout,
            credentials: "include",
        }),
        {
            maxRetries,
            //@ts-expect-error RTK Query's types don't account for this parameter
            retryCondition,
        },
    ),
    endpoints: (builder) => ({
        getAnnouncements: builder.query<
            GenericAPIResponse<AnnouncementResponseDto[]>,
            QueryModel<AnnouncementSearchDto>
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: {
                    query: JSON.stringify(query),
                },
            }),
        }),
        getAnnouncement: builder.query<
            GenericAPIResponse<AnnouncementResponseDto>,
            { announcement_id: number }
        >({
            query: ({ announcement_id }) => ({
                url: `/${announcement_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createAnnouncement: builder.mutation<
            GenericAPIResponse<AnnouncementResponseDto>,
            AnnouncementCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateAnnouncement: builder.mutation<
            GenericAPIResponse<AnnouncementResponseDto>,
            { announcement_id: number } & AnnouncementUpdateDto
        >({
            query: ({ announcement_id, ...data }) => ({
                url: `/${announcement_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteAnnouncement: builder.mutation<
            GenericAPIResponse<boolean>,
            { announcement_id: number }
        >({
            query: ({ announcement_id }) => ({
                url: `/${announcement_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetAnnouncementsQuery,
    useLazyGetAnnouncementQuery,
    useCreateAnnouncementMutation,
    useUpdateAnnouncementMutation,
    useDeleteAnnouncementMutation,
} = AdminAnnouncementAPI;
