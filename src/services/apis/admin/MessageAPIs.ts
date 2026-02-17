import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Message } from "../../../types/entities/Message";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { MessageSearchDto } from "../../../types/dtos/MessageDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminMessageAPI = createApi({
    reducerPath: "adminMessageAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/messages"),
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
