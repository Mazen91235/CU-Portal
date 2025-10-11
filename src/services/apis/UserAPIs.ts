import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GetUserDataAPIResponse } from "../../types/UserAPITypes";
export const UserAPI = createApi({
    reducerPath: "userAPI",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/user" }),
    endpoints: (builder) => ({
        getUserData: builder.query<GetUserDataAPIResponse, string>({
            query: (access_token: string) => ({
                url: "/get-user-data",
                headers: {
                    "Authorization": `Bearer ${access_token}`
                },
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useGetUserDataQuery } = UserAPI;
