import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
  ReleaseResponseDto,
  ReleaseSearchDto,
} from "../../../types/dtos/ReleaseDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
  timeout,
  maxRetries,
  retryCondition,
} from "../../../utils/APIHandling";

export const ReleaseAPI = createApi({
  reducerPath: "releaseAPI",
  baseQuery: retry(
    fetchBaseQuery({
      baseUrl: GetUserApiLink("/releases"),
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
    getReleases: builder.query<
      GenericAPIResponse<ReleaseResponseDto[]>,
      QueryModel<ReleaseSearchDto>
    >({
      query: (query) => ({
        url: "/",
        method: "GET",
        credentials: "include",
        params: { query: JSON.stringify(query) },
      }),
    }),
    getRelease: builder.query<
      GenericAPIResponse<ReleaseResponseDto>,
      { release_id: number }
    >({
      query: ({ release_id }) => ({
        url: `/${release_id}`,
        method: "GET",
        credentials: "include",
      }),
    }),
  }),
});

export const { useLazyGetReleasesQuery, useLazyGetReleaseQuery } = ReleaseAPI;
