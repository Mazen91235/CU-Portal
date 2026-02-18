import { createSlice } from "@reduxjs/toolkit";
import { AuthenticateAPI } from "../../apis/AuthenticateAPIs";
import { UserAPI } from "../../apis/user/UserAPIs";
import type { User } from "../../../types/entities/User";
import {
    validateUserCanAccessAll,
    validateUserEarlyAccess,
    validateUserLevel,
} from "../../../utils/Validators";
import { CourseAPI } from "../../apis/user/CourseAPIs";

const initialState = {
    user: null as User | null,
    isProcessing: false,
    google_access_token: null as string | null,
    permissions: null as string[] | null,
};

const UserSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, { payload }: { payload: User | null }) => {
            state.user = payload;
            validateUserLevel(state.user);
        },
        setIsProcessing: (state, { payload }: { payload: boolean }) => {
            state.isProcessing = payload;
        },
        setPermissions: (state, { payload }: { payload: string[] }) => {
            state.permissions = payload;
            validateUserEarlyAccess(state.user, state.permissions);
            validateUserCanAccessAll(state.user, state.permissions);
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            AuthenticateAPI.endpoints.logout.matchPending,
            (state) => {
                state.isProcessing = true;
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.logout.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.user = null;
                    state.permissions = null;
                    state.google_access_token = null;
                }
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.logout.matchRejected,
            (state) => {
                state.isProcessing = false;
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.getGoogleStoredToken.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.google_access_token =
                        payload.data?.access_token || null;
                }
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.getGoogleAccessToken.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.google_access_token =
                        payload.data?.access_token || null;
                }
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.getUserData.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.user = payload.data || null;
                    state.permissions = null;
                    validateUserLevel(state.user);
                }
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.getUserPermissions.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.permissions = payload.data || [];
                    validateUserEarlyAccess(state.user, state.permissions);
                    validateUserCanAccessAll(state.user, state.permissions);
                }
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.updateUserData.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") state.user = null;
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.updateUserAcademicData.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") state.user = null;
            },
        );
        builder.addMatcher(
            CourseAPI.endpoints.registerCourse.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") state.user = null;
            },
        );
        builder.addMatcher(
            CourseAPI.endpoints.unregisterCourse.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") state.user = null;
            },
        );
    },
});

export const { setUser, setIsProcessing, setPermissions } = UserSlice.actions;

export default UserSlice.reducer;
