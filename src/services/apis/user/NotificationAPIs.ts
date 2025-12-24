import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Notification } from "../../../types/entities/Notification";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { NotificationSearchDto } from "../../../types/dtos/NotificationDTOs"

export const NotificationAPI = createApi({
    reducerPath: "notificationAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/notifications"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
