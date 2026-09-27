import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    AnnouncementResponseDto,
    AnnouncementSearchDto,
} from "../../../types/dtos/AnnouncementDtos";
import type { QueryModel } from "../../../types/models/QueryModel";

export const AnnouncementAPI = createApi({
    reducerPath: "announcementAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/announcements"),
        credentials: "include",
    }),
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
    }),
});

export const { useLazyGetAnnouncementsQuery, useLazyGetAnnouncementQuery } =
    AnnouncementAPI;
