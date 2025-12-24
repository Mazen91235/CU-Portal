import { createSlice } from "@reduxjs/toolkit";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { NotificationAPI } from "../../apis/user/NotificationAPIs";
import type { Notification } from "../../../types/entities/Notification";

const initialState = {
    notifications: [] as Notification[],
};

const NotificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addMatcher(
            NotificationAPI.endpoints.getNotifications.matchFulfilled,
            (
                state,
                { payload }: { payload: GenericAPIResponse<Notification[]> }
            ) => {
                if (payload.status == "success") {
                    state.notifications = payload.data || [];
                }
            }
        );
    },
});

export default NotificationSlice.reducer;
