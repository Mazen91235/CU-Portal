import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../../../utils/CustomBaseQuery";
import { timeout } from "../../../utils/APIHandling";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { GetUserApiLink } from "../../../utils/LinkHandler";
import type {
    ReleaseResponseDto,
    ReleaseSearchDto,
} from "../../../types/dtos/ReleaseDtos";
import type { VersionResponseDto } from "../../../types/dtos/VersionDtos";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    getLatestReleaseCandidate,
    isLatestReleaseQuery,
    isReleaseAtLeastAsRecent,
    isReleaseLater,
    readLatestReleaseCache,
    writeLatestReleaseCache,
} from "../../../utils/LatestRelease";
export const ReleaseAPI = createApi({
    reducerPath: "releaseAPI",
    baseQuery: customBaseQuery({
        baseUrl: GetUserApiLink("/releases"),
        timeout,
        credentials: "include",
    }),
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
    }),
});

export const {
    useLazyGetReleasesQuery,
    useLazyGetReleaseQuery,
    useLazyGetVersionsQuery,
} = ReleaseAPI;
