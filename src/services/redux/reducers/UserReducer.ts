import { createSlice } from "@reduxjs/toolkit";
import { AuthenticateAPI } from "../../apis/AuthenticateAPIs";
import { UserAPI } from "../../apis/user/UserAPIs";
import type { User } from "../../../types/entities/User";

const initialState = {
    user: null as User | null,
    access_token: null as string | null,
    google_access_token: null as string | null,
    permissions: [] as string[],
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
            }
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.refreshToken.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.access_token = payload.data?.access_token || null;
                }
            }
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.getGoogleStoredToken.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.google_access_token =
                        payload.data?.access_token || null;
                }
            }
        );
        builder.addMatcher(
            AuthenticateAPI.endpoints.getGoogleAccessToken.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.google_access_token =
                        payload.data?.access_token || null;
                }
            }
        );
        builder.addMatcher(
            UserAPI.endpoints.getUserData.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.user = payload.data || null;
                }
            }
        );
        builder.addMatcher(
            UserAPI.endpoints.getUserPermissions.matchFulfilled,
            (state, { payload }) => {
                if (payload.status == "success") {
                    state.permissions = payload.data || [];
                }
            }
        );
    },
});

export const { setAccessToken, setPermissions } = UserSlice.actions;

export default UserSlice.reducer;
