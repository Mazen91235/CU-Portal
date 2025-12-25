import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Announcement } from "../../../types/entities/Announcement";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { AnnouncementSearchDto } from "../../../types/dtos/AnnouncementDTOs";

export const AnnouncementAPI = createApi({
    reducerPath: "announcementAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/announcements"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
