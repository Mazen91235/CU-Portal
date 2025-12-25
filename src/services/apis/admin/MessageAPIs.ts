import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Message } from "../../../types/entities/Message";
import type { RootState } from "../../redux/Store";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { MessageSearchDto } from "../../../types/dtos/MessageDTOs";
export const AdminMessageAPI = createApi({
    reducerPath: "adminMessageAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetAdminApiLink("/messages"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getMessages: builder.query<
            GenericAPIResponse<Message[]>,
            MessageSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
    }),
});

export const { useLazyGetMessagesQuery } = AdminMessageAPI;
