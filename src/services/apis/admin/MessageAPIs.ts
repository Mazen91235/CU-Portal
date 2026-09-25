import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    MessageResponseDto,
    MessageSearchDto,
} from "../../../types/dtos/MessageDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const AdminMessageAPI = createApi({
    reducerPath: "adminMessageAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetAdminApiLink("/messages"),
        timeout,
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getMessages: builder.query<
            GenericAPIResponse<MessageResponseDto[]>,
            QueryModel<MessageSearchDto>
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
    }),
});

export const { useLazyGetMessagesQuery } = AdminMessageAPI;
