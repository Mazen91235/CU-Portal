import { createSlice } from "@reduxjs/toolkit";
import type { GetUserDataAPIResponse } from "../../../types/UserAPITypes";

const initialState = {
    user: null as GetUserDataAPIResponse["data"] | null,
    access_token: null as string | null,
    isLoading: false as boolean,
    permissions: [] as string[],
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setPermissions: (state, action) => {
            state.permissions = action.payload;
        },
        setAccessToken: (state, action) => {
            state.access_token = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.access_token = null;
        },
    },
});

export const { setUser, setLoading, setPermissions, setAccessToken, logout } = userSlice.actions;

export default userSlice.reducer;
