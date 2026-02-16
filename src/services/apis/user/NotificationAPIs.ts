import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Notification } from "../../../types/entities/Notification";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { NotificationSearchDto } from "../../../types/dtos/NotificationDTOs";

export const NotificationAPI = createApi({
    reducerPath: "notificationAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/notifications"),
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getNotifications: builder.query<
            GenericAPIResponse<Notification[]>,
            NotificationSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        markNotificationAsSeen: builder.mutation<
            GenericAPIResponse<Notification>,
            { notification_id: number }
        >({
            query: ({ notification_id }) => ({
                url: `/${notification_id}`,
                method: "PATCH",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetNotificationsQuery,
    useMarkNotificationAsSeenMutation,
} = NotificationAPI;
