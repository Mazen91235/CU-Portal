import { createSlice } from "@reduxjs/toolkit";
import { AuthenticateAPI } from "../../apis/AuthenticateAPIs";
import { UserAPI } from "../../apis/user/UserAPIs";
import type { User } from "../../../types/entities/User";
import { validateUserLevel } from "../../../utils/Validators";

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
        },
        setIsProcessing: (state, { payload }: { payload: boolean }) => {
            state.isProcessing = payload;
        },
        setPermissions: (state, { payload }: { payload: string[] }) => {
            state.permissions = payload;
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
                state.isProcessing = false;
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
                    if (!state.user) return;
                    state.user.level = validateUserLevel(state.user);
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
                    const accessPermissions = [
                        "Access All Faculties",
                        "Access All Departments",
                        "Access All Years",
                    ];
                    if (
                        state.user &&
                        accessPermissions.every((p) =>
                            state.permissions?.includes(p),
                        )
                    ) {
                        state.user.canAccessAll = true;
                    }
                }
            },
        );
    },
});

export const { setUser, setIsProcessing, setPermissions } = UserSlice.actions;

export default UserSlice.reducer;
