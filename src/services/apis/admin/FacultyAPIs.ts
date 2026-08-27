import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    FacultyCreateDto,
    FacultyResponseDto,
    FacultySearchDto,
    FacultyUpdateDto,
} from "../../../types/dtos/FacultyDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminFacultyAPI = createApi({
    reducerPath: "adminFacultyAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/faculties"),
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
        getFaculties: builder.query<
            GenericAPIResponse<FacultyResponseDto[]>,
            QueryModel<FacultySearchDto>
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
        getFaculty: builder.query<
            GenericAPIResponse<FacultyResponseDto>,
            { faculty_id: number }
        >({
            query: ({ faculty_id }) => ({
                url: `/${faculty_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createFaculty: builder.mutation<
            GenericAPIResponse<FacultyResponseDto>,
            FacultyCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateFaculty: builder.mutation<
            GenericAPIResponse<FacultyResponseDto>,
            { faculty_id: number } & FacultyUpdateDto
        >({
            query: ({ faculty_id, ...data }) => ({
                url: `/${faculty_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteFaculty: builder.mutation<
            GenericAPIResponse,
            { faculty_id: number }
        >({
            query: ({ faculty_id }) => ({
                url: `/${faculty_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetFacultiesQuery,
    useLazyGetFacultyQuery,
    useCreateFacultyMutation,
    useUpdateFacultyMutation,
    useDeleteFacultyMutation,
} = AdminFacultyAPI;
