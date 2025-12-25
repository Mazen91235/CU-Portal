import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Announcement } from "../../../types/entities/Announcement";
import type { RootState } from "../../redux/Store";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { AnnouncementSearchDto } from "../../../types/dtos/AnnouncementDTOs";
export const AdminAnnouncementAPI = createApi({
    reducerPath: "adminAnnouncementAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetAdminApiLink("/announcements"),
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
        createAnnouncement: builder.mutation<
            GenericAPIResponse<Announcement>,
            Announcement
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateAnnouncement: builder.mutation<
            GenericAPIResponse<Announcement>,
            { announcement_id: number } & Announcement
        >({
            query: ({ announcement_id, ...data }) => ({
                url: `/${announcement_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteAnnouncement: builder.mutation<
            GenericAPIResponse,
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
