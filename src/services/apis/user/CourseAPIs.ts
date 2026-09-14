import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    SubjectResponseDto,
    SubjectSearchDto,
    SubjectSearchAvailableDto,
} from "../../../types/dtos/SubjectDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const CourseAPI = createApi({
    reducerPath: "courseAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/courses"),
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
        getCourses: builder.query<
            GenericAPIResponse<SubjectResponseDto[]>,
            QueryModel<SubjectSearchDto>
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
        getCourse: builder.query<
            GenericAPIResponse<SubjectResponseDto>,
            { subject_id: number }
        >({
            query: ({ subject_id }) => ({
                url: `/${subject_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getEnrolledCourses: builder.query<
            GenericAPIResponse<SubjectResponseDto[]>,
            void
        >({
            query: () => ({
                url: "/enrolled",
                method: "GET",
                credentials: "include",
            }),
        }),
        getEnrolledCourse: builder.query<
            GenericAPIResponse<SubjectResponseDto>,
            { subject_id: number }
        >({
            query: ({ subject_id }) => ({
                url: `/enrolled/${subject_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getAvailableCourses: builder.query<
            GenericAPIResponse<SubjectResponseDto[]>,
            QueryModel<SubjectSearchAvailableDto>
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
        registerCourse: builder.mutation<
            GenericAPIResponse,
            { subject_id: number }
        >({
            query: (data) => ({
                url: `/register`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success) {
                        localStorage.removeItem("user");
                    }
                } catch {
                    return;
                }
            },
        }),
        unregisterCourse: builder.mutation<
            GenericAPIResponse,
            { subject_id: number }
        >({
            query: (data) => ({
                url: `/unregister`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.success) {
                        localStorage.removeItem("user");
                    }
                } catch {
                    return;
                }
            },
        }),
    }),
});

export const {
    useLazyGetCoursesQuery,
    useLazyGetCourseQuery,
    useLazyGetEnrolledCoursesQuery,
    useLazyGetEnrolledCourseQuery,
    useLazyGetAvailableCoursesQuery,
    useRegisterCourseMutation,
    useUnregisterCourseMutation,
} = CourseAPI;
