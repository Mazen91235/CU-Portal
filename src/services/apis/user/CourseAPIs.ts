import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { Subject } from "../../../types/entities/Subject";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { SearchDto } from "../../../types/dtos/SearchDTOs";
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
        getEnrolledCourses: builder.query<GenericAPIResponse<Subject[]>, void>({
            query: () => ({
                url: "/enrolled",
                method: "GET",
                credentials: "include",
            }),
        }),
        getEnrolledCourse: builder.query<
            GenericAPIResponse<Subject>,
            { course_id: number }
        >({
            query: ({ course_id }) => ({
                url: `/enrolled/${course_id}`,
                method: "GET",
                credentials: "include",
            }),
        }),
        getAvailableCourses: builder.query<
            GenericAPIResponse<Subject[]>,
            SearchDto
        >({
            query: (query) => ({
                url: "/",
                method: "GET",
                credentials: "include",
                params: query,
            }),
        }),
        registerCourse: builder.mutation<
            GenericAPIResponse,
            { course_id: number }
        >({
            query: (query) => ({
                url: `/register`,
                method: "POST",
                credentials: "include",
                body: query,
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.status == "success") {
                        localStorage.removeItem("user");
                    }
                } catch {
                    return;
                }
            },
        }),
        unregisterCourse: builder.mutation<
            GenericAPIResponse,
            { course_id: number }
        >({
            query: (query) => ({
                url: `/unregister`,
                method: "POST",
                credentials: "include",
                body: query,
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (data.status == "success") {
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
    useLazyGetEnrolledCoursesQuery,
    useLazyGetEnrolledCourseQuery,
    useLazyGetAvailableCoursesQuery,
    useRegisterCourseMutation,
    useUnregisterCourseMutation,
} = CourseAPI;
