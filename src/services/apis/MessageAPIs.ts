import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../types/responses/GenericAPIResponse";
import type {
    MessageCreateDto,
    MessageResponseDto,
} from "../../types/dtos/MessageDtos";
import { GetApiLink } from "../../utils/LinkHandler";
export const MessageAPI = createApi({
    reducerPath: "messageAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetApiLink("/messages"),
        credentials: "include",
    }),
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
