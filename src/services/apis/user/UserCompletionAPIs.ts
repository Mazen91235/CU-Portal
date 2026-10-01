import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    UserCompletionCreateDto,
    UserCompletionResponseDto,
    UserCompletionSearchDto,
} from "../../../types/dtos/UserCompletionDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
export const UserCompletionAPI = createApi({
    reducerPath: "userCompletionAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/completions"),
        credentials: "include",
    }),
    endpoints: (builder) => ({
        getUserCompletions: builder.query<
            GenericAPIResponse<UserCompletionResponseDto[]>,
            QueryModel<UserCompletionSearchDto>
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
        getUserCompletion: builder.query<
            GenericAPIResponse<UserCompletionResponseDto>,
            { user_completion_id: number }
        >({
            query: ({ user_completion_id }) => ({
                url: `/${user_completion_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createUserCompletion: builder.mutation<
            GenericAPIResponse<UserCompletionResponseDto>,
            UserCompletionCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        deleteUserCompletion: builder.mutation<
            GenericAPIResponse,
            { user_completion_id: number }
        >({
            query: ({ user_completion_id }) => ({
                url: `/${user_completion_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetUserCompletionsQuery,
    useLazyGetUserCompletionQuery,
    useCreateUserCompletionMutation,
    useDeleteUserCompletionMutation,
} = UserCompletionAPI;
