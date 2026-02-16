import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Faculty } from "../../../types/entities/Faculty";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type { FacultySearchDto } from "../../../types/dtos/FacultyDTOs";
export const AdminFacultyAPI = createApi({
    reducerPath: "adminFacultyAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/faculties"),
            timeout: 5000,
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getFaculties: builder.query<
            GenericAPIResponse<Faculty[]>,
            FacultySearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getFaculty: builder.query<
            GenericAPIResponse<Faculty>,
            { faculty_id: number }
        >({
            query: ({ faculty_id }) => ({
                url: `/view/${faculty_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        searchFaculties: builder.query<
            GenericAPIResponse<Faculty[]>,
            FacultySearchDto
        >({
            query: (query) => ({
                url: `/search`,
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        createFaculty: builder.mutation<GenericAPIResponse<Faculty>, Faculty>({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateFaculty: builder.mutation<
            GenericAPIResponse<Faculty>,
            { faculty_id: number } & Faculty
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
    useLazySearchFacultiesQuery,
    useCreateFacultyMutation,
    useUpdateFacultyMutation,
    useDeleteFacultyMutation,
} = AdminFacultyAPI;
