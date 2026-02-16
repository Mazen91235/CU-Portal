import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Grade } from "../../../types/entities/Grade";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { SearchDto } from "../../../types/dtos/SearchDTOs";
export const GradeAPI = createApi({
    reducerPath: "gradeAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/grades"),
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getGrades: builder.query<
            GenericAPIResponse<Grade[]>,
            {
                subject_id?: number;
                parent_id?: number;
            } & SearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        getGradeParents: builder.query<
            GenericAPIResponse<Grade[]>,
            {
                grade_id: number;
            }
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
    }),
});

export const {
    useLazyGetGradesQuery,
    useLazyGetGradeParentsQuery,
    useLazyGetGradeQuery,
} = GradeAPI;
