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
    google_access_token: null as string | null,
    permissions: null as string[] | null,
    isProcessing: false,
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
        setIsProcessing: (state, { payload }: { payload: boolean }) => {
            state.isProcessing = payload;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            AuthenticateAPI.endpoints.logout.matchFulfilled,
            (state, { payload }) => {
                if (payload.success === true) {
                    state.isProcessing = true;
                    state.user = null;
                    state.permissions = null;
                    state.google_access_token = null;
                }
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

export const { setUser, setPermissions, setIsProcessing } = UserSlice.actions;

export default UserSlice.reducer;
