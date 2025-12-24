import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Year } from "../../../types/entities/Year";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
 import type { MaterialSearchDto } from "../../../types/dtos/MaterialDTOs";
export const AdminYearAPI = createApi({
    reducerPath: "adminYearAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/years"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getYears: builder.query<
            GenericAPIResponse<Year[]>,
            MaterialSearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getYear: builder.query<GenericAPIResponse<Year>, { year_id: number }>({
            query: ({ year_id }) => ({
                url: `/${year_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        searchYears: builder.query<GenericAPIResponse<Year[]>, MaterialSearchDto>({
            query: (query) => ({
                url: `/search`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        createYear: builder.mutation<GenericAPIResponse<Year>, Year>({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateYear: builder.mutation<
            GenericAPIResponse<Year>,
            { year_id: number } & Year
        >({
            query: ({ year_id, ...data }) => ({
                url: `/${year_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteYear: builder.mutation<GenericAPIResponse, { year_id: number }>({
            query: ({ year_id }) => ({
                url: `/${year_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetYearsQuery,
    useLazyGetYearQuery,
    useLazySearchYearsQuery,
    useCreateYearMutation,
    useUpdateYearMutation,
    useDeleteYearMutation,
} = AdminYearAPI;
