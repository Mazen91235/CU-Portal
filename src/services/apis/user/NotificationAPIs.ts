import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Notification } from "../../../types/entities/Notification";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { NotificationSearchDto } from "../../../types/dtos/NotificationDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";

export const NotificationAPI = createApi({
    reducerPath: "notificationAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/notifications"),
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
