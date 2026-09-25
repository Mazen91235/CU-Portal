import { createSlice } from "@reduxjs/toolkit";
import { AuthenticateAPI } from "../../apis/AuthenticateAPIs";
import { UserAPI } from "../../apis/user/UserAPIs";
import type { UserResponseDto } from "../../../types/dtos/UserDtos";
import {
    validateUserCanAccessAll,
    validateUserEarlyAccess,
    validateUserLevel,
} from "../../../utils/Validators";
import { CourseAPI } from "../../apis/user/CourseAPIs";

const initialState = {
    user: null as UserResponseDto | null,
    isProcessing: false,
    pendingRequests: 0,
    google_access_token: null as string | null,
    permissions: null as string[] | null,
};

const UserSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, { payload }: { payload: UserResponseDto | null }) => {
            state.user = payload;
            validateUserLevel(state.user);
            validateUserEarlyAccess(state.user, state.permissions);
            validateUserCanAccessAll(state.user, state.permissions);
        },
        setPermissions: (state, { payload }: { payload: string[] }) => {
            state.permissions = payload;
            validateUserEarlyAccess(state.user, state.permissions);
            validateUserCanAccessAll(state.user, state.permissions);
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            AuthenticateAPI.endpoints.isLoggedIn.matchPending,
            (state) => {
                state.pendingRequests += 1;
                state.isProcessing = true;
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.isLoggedIn.matchFulfilled,
            (state) => {
                state.pendingRequests = Math.max(
                    0,
                    state.pendingRequests - 1,
                );
                state.isProcessing = state.pendingRequests > 0;
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.isLoggedIn.matchRejected,
            (state) => {
                state.pendingRequests = Math.max(
                    0,
                    state.pendingRequests - 1,
                );
                state.isProcessing = state.pendingRequests > 0;
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.logout.matchPending,
            (state) => {
                state.pendingRequests += 1;
                state.isProcessing = true;
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.logout.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) {
                    state.user = null;
                    state.permissions = null;
                    state.google_access_token = null;
                }
                state.pendingRequests = Math.max(
                    0,
                    state.pendingRequests - 1,
                );
                state.isProcessing = state.pendingRequests > 0;
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.logout.matchRejected,
            (state) => {
                state.pendingRequests = Math.max(
                    0,
                    state.pendingRequests - 1,
                );
                state.isProcessing = state.pendingRequests > 0;
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.getGoogleStoredToken.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) {
                    state.google_access_token = payload.data || null;
                }
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.getGoogleAccessToken.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) {
                    state.google_access_token = payload.data || null;
                }
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.getUserData.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) {
                    state.user = payload.data || null;
                    state.permissions = null;
                    validateUserLevel(state.user);
                }
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.getUserPermissions.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) {
                    state.permissions = payload.data || [];
                    validateUserEarlyAccess(state.user, state.permissions);
                    validateUserCanAccessAll(state.user, state.permissions);
                }
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.updateUserData.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) state.user = null;
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.updateUserAcademicData.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) state.user = null;
            },
        );
        builder.addMatcher(
            CourseAPI.endpoints.registerCourse.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) state.user = null;
            },
        );
        builder.addMatcher(
            CourseAPI.endpoints.unregisterCourse.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) state.user = null;
            },
        );
    },
});

export const { setUser, setPermissions } = UserSlice.actions;

export default UserSlice.reducer;
