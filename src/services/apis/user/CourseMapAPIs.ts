import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import type { RootState } from "../../redux/Store";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type { CourseMapResponseDto } from "../../../types/dtos/CourseMapDTOs";
export const CourseMapAPI = createApi({
    reducerPath: "coursemapAPI",
    baseQuery: fetchBaseQuery({
        baseUrl: GetUserApiLink("/course-map"),
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).user.access_token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
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
