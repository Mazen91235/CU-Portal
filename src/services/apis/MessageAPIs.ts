import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type { Message } from "../../types/entities/Message";
import { GetApiLink } from "../../utils/LinkHandler";
export const MessageAPI = createApi({
    reducerPath: "messageAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetApiLink("/messages"),
            timeout: 5000,
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        createMessage: builder.mutation<GenericAPIResponse<Message>, Message>({
            query: (data) => ({
                url: "/",
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
    }),
});

export const { useCreateMessageMutation } = MessageAPI;
