import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    NotificationResponseDto,
    NotificationMarkManyAsSeenDto,
} from "../../../types/dtos/NotificationDtos";
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
        markNotificationsAsSeen: builder.mutation<
            GenericAPIResponse,
            NotificationMarkManyAsSeenDto
        >({
            query: (data) => ({
                url: `/seen`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
    }),
});

export const {
    useLazyGetNotificationsQuery,
    useMarkNotificationsAsSeenMutation,
} = NotificationAPI;
