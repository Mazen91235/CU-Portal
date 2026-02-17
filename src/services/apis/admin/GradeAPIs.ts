import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Grade } from "../../../types/entities/Grade";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    GradeRegisterDto,
    GradeSearchDto,
} from "../../../types/dtos/GradeDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const AdminGradeAPI = createApi({
    reducerPath: "adminGradeAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/grades"),
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
        getGrades: builder.query<GenericAPIResponse<Grade[]>, GradeSearchDto>({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getGradeParents: builder.query<
            GenericAPIResponse<Grade[]>,
            { grade_id: number }
        >({
            query: ({ grade_id }) => ({
                url: `/${grade_id}/parents`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getGrade: builder.query<
            GenericAPIResponse<Grade>,
            { grade_id: number }
        >({
            query: ({ grade_id }) => ({
                url: `/${grade_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createGrade: builder.mutation<
            GenericAPIResponse<Grade>,
            GradeRegisterDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateGrade: builder.mutation<
            GenericAPIResponse<Grade>,
            { grade_id: number } & GradeRegisterDto
        >({
            query: ({ grade_id, ...data }) => ({
                url: `/${grade_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteGrade: builder.mutation<GenericAPIResponse, { grade_id: number }>(
            {
                query: ({ grade_id }) => ({
                    url: `/${grade_id}`,
                    method: "DELETE",
                    credentials: "include",
                }),
            },
        ),
    }),
});

export const {
    useLazyGetGradesQuery,
    useLazyGetGradeQuery,
    useLazyGetGradeParentsQuery,
    useCreateGradeMutation,
    useUpdateGradeMutation,
    useDeleteGradeMutation,
} = AdminGradeAPI;
