import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    NotificationResponseDto,
    NotificationMarkManyAsSeenDto,
} from "../../../types/dtos/NotificationDtos";
import type { UserNotificationSearchDto } from "../../../types/dtos/UserNotificationDtos";
import type { QueryModel } from "../../../types/models/QueryModel";

export const NotificationAPI = createApi({
    reducerPath: "notificationAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/notifications"),
        credentials: "include",
    }),
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
