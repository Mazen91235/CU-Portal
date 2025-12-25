import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type { Message } from "../../types/entities/Message";
import type { RootState } from "../redux/Store";
import { GetApiLink } from "../../utils/LinkHandler";
export const MessageAPI = createApi({
    reducerPath: "messageAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetApiLink("/messages"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
