import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { CourseMapResponseDto } from "../../../types/dtos/CourseMapDTOs";
export const CourseMapAPI = createApi({
    reducerPath: "coursemapAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/course-map"),
            timeout: 5000,
            credentials: "include",
        }),
    ),
    endpoints: (builder) => ({
        getCourseMap: builder.query<
            GenericAPIResponse<CourseMapResponseDto>,
            void
        >({
            query: () => ({
                url: "/",
                method: "GET",
                credentials: "include",
            }),
        }),
    }),
});

export const { useLazyGetCourseMapQuery } = CourseMapAPI;
