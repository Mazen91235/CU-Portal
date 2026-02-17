import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { CourseMapResponseDto } from "../../../types/dtos/CourseMapDTOs";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
export const CourseMapAPI = createApi({
    reducerPath: "coursemapAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetUserApiLink("/course-map"),
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
