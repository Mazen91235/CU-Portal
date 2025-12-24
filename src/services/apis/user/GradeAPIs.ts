import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Grade } from "../../../types/entities/Grade";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { SearchDto } from "../../../types/dtos/SearchDTOs";
export const GradeAPI = createApi({
    reducerPath: "gradeAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/grades"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
