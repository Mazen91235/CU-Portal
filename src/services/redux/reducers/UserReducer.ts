import { createSlice } from "@reduxjs/toolkit";
import { AuthenticateAPI } from "../../apis/AuthenticateAPIs";
import { UserAPI } from "../../apis/user/UserAPIs";
import type { User } from "../../../types/entities/User";

const initialState = {
    user: null as User | null,
    access_token: null as string | null,
    google_access_token: null as string | null,
    permissions: null as string[] | null,
};

const UserSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setAccessToken: (state, { payload }: { payload: string }) => {
            state.access_token = payload;
        },
        setPermissions: (state, { payload }: { payload: string[] }) => {
            state.permissions = payload;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            AuthenticateAPI.endpoints.logout.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.user = null;
                    state.access_token = null;
                }
            },
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.refreshToken.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.access_token = payload.data?.access_token || null;
                }
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
                    if (!state.user) return;
                    if (
                        !state.user?.faculty ||
                        !state.user?.department ||
                        !state.user?.year ||
                        !state.user?.type ||
                        state.user?.type === ""
                    ) {
                        state.user.level = 1;
                    } else if (!state.user?.status) {
                        state.user.level = 2;
                    } else if ((state.user.enrolled_courses_count || 0) < 1) {
                        state.user.level = 3;
                    } else {
                        state.user.level = 4;
                    }
                }
            },
        );
        builder.addMatcher(
            UserAPI.endpoints.getUserPermissions.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.permissions = payload.data || [];
                    if (state.user && state.user.is_early_access) {
                        state.permissions = state.permissions.filter(
                            (p) => p != "Early Access",
                        );
                        state.permissions.push("Early Access");
                    }
                }
            },
        );
    },
});

export const { setAccessToken, setPermissions } = UserSlice.actions;

export default UserSlice.reducer;
