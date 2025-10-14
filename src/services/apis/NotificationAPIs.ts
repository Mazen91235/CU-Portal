import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type { Notification } from "../../types/entities/Notification";
import type { RootState } from "../redux/Store";
export const NotificationAPI = createApi({
    reducerPath: "notificationAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: "/api/user",
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
            { seen?: boolean; page?: number; limit?: number }
        >({
            query: ({ seen = false, page = 1, limit = 50 }) => ({
                url: "/notifications",
                method: "GET",
                credentials: "include",
                params: { seen, page, limit },
            }),
        }),
        markNotificationAsSeen: builder.mutation<
            GenericAPIResponse<Notification>,
            number
        >({
            query: (id) => ({
                url: `/notifications/${id}`,
                method: "PATCH",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetNotificationsQuery, useMarkNotificationAsSeenMutation } = NotificationAPI;
