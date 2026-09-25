import { createSlice } from "@reduxjs/toolkit";
import type {
    ReleaseResponseDto,
    ReleaseSearchDto,
} from "../../../types/dtos/ReleaseDtos";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { ReleaseAPI } from "../../apis/user/ReleaseAPIs";
import { AdminReleaseAPI } from "../../apis/admin/ReleaseAPIs";
import type { QueryModel } from "../../../types/models/QueryModel";
import {
    getLatestReleaseCandidate,
    isLatestReleaseQuery,
    isReleaseAtLeastAsRecent,
    isReleaseLater,
} from "../../../utils/LatestRelease";

const initialState = {
    latestRelease: null as ReleaseResponseDto | null,
    isProcessing: false,
    pendingRequests: 0,
};

const updateLatestRelease = (
    state: typeof initialState,
    payload: GenericAPIResponse<ReleaseResponseDto[]>,
    originalArgs: QueryModel<ReleaseSearchDto>,
) => {
    if (!payload.success || !payload.data?.length) return;

    const latestReleaseQuery = isLatestReleaseQuery(originalArgs);
    const candidate = getLatestReleaseCandidate(
        payload.data,
        latestReleaseQuery,
    );

    if (!candidate) return;

    if (
        latestReleaseQuery &&
        (!state.latestRelease ||
            isReleaseAtLeastAsRecent(candidate, state.latestRelease))
    ) {
        state.latestRelease = candidate;
        return;
    }

    if (
        !latestReleaseQuery &&
        state.latestRelease &&
        isReleaseLater(candidate, state.latestRelease)
    ) {
        state.latestRelease = candidate;
    }
};

const ReleaseSlice = createSlice({
    name: "release",
    initialState,
    reducers: {
        setLatestRelease: (
            state,
            { payload }: { payload: ReleaseResponseDto | null },
        ) => {
            state.latestRelease = payload;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            ReleaseAPI.endpoints.getReleases.matchFulfilled,
            (state, { payload, meta }) => {
                updateLatestRelease(state, payload, meta.arg.originalArgs);
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.isProcessing = state.pendingRequests > 0;
            },
        );
        builder.addMatcher(
            AdminReleaseAPI.endpoints.getReleases.matchFulfilled,
            (state, { payload, meta }) => {
                updateLatestRelease(state, payload, meta.arg.originalArgs);
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.isProcessing = state.pendingRequests > 0;
            },
        );
        builder.addMatcher(
            ReleaseAPI.endpoints.getReleases.matchPending,
            (state) => {
                state.pendingRequests += 1;
                state.isProcessing = true;
            },
        );
        builder.addMatcher(
            AdminReleaseAPI.endpoints.getReleases.matchPending,
            (state) => {
                state.pendingRequests += 1;
                state.isProcessing = true;
            },
        );
        builder.addMatcher(
            ReleaseAPI.endpoints.getReleases.matchRejected,
            (state) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.isProcessing = state.pendingRequests > 0;
            },
        );
        builder.addMatcher(
            AdminReleaseAPI.endpoints.getReleases.matchRejected,
            (state) => {
                state.pendingRequests = Math.max(0, state.pendingRequests - 1);
                state.isProcessing = state.pendingRequests > 0;
            },
        );
    },
});

export const { setLatestRelease } = ReleaseSlice.actions;

export default ReleaseSlice.reducer;
