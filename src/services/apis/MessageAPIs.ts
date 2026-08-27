import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type {
    MessageCreateDto,
    MessageResponseDto,
} from "../../types/dtos/MessageDtos";
import { GetApiLink } from "../../utils/LinkHandler";
import { timeout, maxRetries, retryCondition } from "../../utils/APIHandling";
export const MessageAPI = createApi({
    reducerPath: "messageAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetApiLink("/messages"),
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
        createMessage: builder.mutation<
            GenericAPIResponse<MessageResponseDto>,
            MessageCreateDto
        >({
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
