import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { NotificationResponseDto } from "../../../types/dtos/NotificationDtos";
import type { UserNotificationSearchDto } from "../../../types/dtos/UserNotificationDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
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
            GenericAPIResponse<NotificationResponseDto[]>,
            QueryModel<UserNotificationSearchDto>
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
        markNotificationAsSeen: builder.mutation<
            GenericAPIResponse<boolean>,
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
