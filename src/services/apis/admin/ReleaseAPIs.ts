import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetAdminApiLink } from "../../../utils/LinkHandler";
import type {
    ReleaseCreateDto,
    ReleaseResponseDto,
    ReleaseSearchDto,
    ReleaseUpdateDto,
} from "../../../types/dtos/ReleaseDtos";
import type { VersionResponseDto } from "../../../types/dtos/VersionDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    timeout,
    maxRetries,
    retryCondition,
} from "../../../utils/APIHandling";
import {
    getLatestReleaseCandidate,
    isLatestReleaseQuery,
    isReleaseAtLeastAsRecent,
    isReleaseLater,
    readLatestReleaseCache,
    writeLatestReleaseCache,
} from "../../../utils/LatestRelease";
export const AdminReleaseAPI = createApi({
    reducerPath: "adminReleaseAPI",
    baseQuery: retry(
        fetchBaseQuery({
            baseUrl: GetAdminApiLink("/releases"),
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
                params: {
                    query: JSON.stringify(query),
                },
            }),
            onQueryStarted: async (query, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    if (!data.success || !data.data?.length) return;

                    const latestReleaseQuery = isLatestReleaseQuery(query);
                    const candidate = getLatestReleaseCandidate(
                        data.data,
                        latestReleaseQuery,
                    );
                    if (!candidate) return;

                    const cached = readLatestReleaseCache();

                    if (
                        (latestReleaseQuery &&
                            (!cached ||
                                isReleaseAtLeastAsRecent(
                                    candidate,
                                    cached.release,
                                ))) ||
                        (!latestReleaseQuery &&
                            cached &&
                            isReleaseLater(candidate, cached.release))
                    ) {
                        writeLatestReleaseCache(candidate);
                    }
                } catch {
                    return;
                }
            },
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
        getVersions: builder.query<
            GenericAPIResponse<VersionResponseDto[]>,
            void
        >({
            query: () => ({
                url: `/versions`,
                method: "GET",
                credentials: "include",
            }),
        }),
        createRelease: builder.mutation<
            GenericAPIResponse<ReleaseResponseDto>,
            ReleaseCreateDto
        >({
            query: (data) => ({
                url: `/`,
                method: "POST",
                credentials: "include",
                body: data,
            }),
        }),
        updateRelease: builder.mutation<
            GenericAPIResponse<ReleaseResponseDto>,
            { release_id: number } & ReleaseUpdateDto
        >({
            query: ({ release_id, ...data }) => ({
                url: `/${release_id}`,
                method: "PATCH",
                credentials: "include",
                body: data,
            }),
        }),
        deleteRelease: builder.mutation<
            GenericAPIResponse,
            { release_id: number }
        >({
            query: ({ release_id }) => ({
                url: `/${release_id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
});

export const {
    useLazyGetReleasesQuery,
    useLazyGetReleaseQuery,
    useLazyGetVersionsQuery,
    useCreateReleaseMutation,
    useUpdateReleaseMutation,
    useDeleteReleaseMutation,
} = AdminReleaseAPI;
