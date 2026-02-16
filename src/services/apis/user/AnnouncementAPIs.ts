import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Announcement } from "../../../types/entities/Announcement";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { AnnouncementSearchDto } from "../../../types/dtos/AnnouncementDTOs";

export const AnnouncementAPI = createApi({
    reducerPath: "announcementAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/announcements"),
            timeout: 5000,
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getAnnouncements: builder.query<
            GenericAPIResponse<Announcement[]>,
            AnnouncementSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getAnnouncement: builder.query<
            GenericAPIResponse<Announcement>,
            { announcement_id: number }
        >({
            query: ({ announcement_id }) => ({
                url: `/${announcement_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetAnnouncementsQuery, useLazyGetAnnouncementQuery } =
    AnnouncementAPI;
