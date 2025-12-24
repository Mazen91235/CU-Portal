import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Grade } from "../../../types/entities/Grade";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    GradeRegisterDto,
    GradeSearchDto,
} from "../../../types/dtos/GradeDTOs";
export const AdminGradeAPI = createApi({
    reducerPath: "adminGradeAPI",
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
            }
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
