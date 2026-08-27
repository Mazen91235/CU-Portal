import { createSlice } from "@reduxjs/toolkit";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { NotificationAPI } from "../../apis/user/NotificationAPIs";
import type { NotificationResponseDto } from "../../../types/dtos/NotificationDtos";

const initialState = {
    notifications: [] as NotificationResponseDto[],
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
                { payload }: { payload: GenericAPIResponse<NotificationResponseDto[]> },
            ) => {
                if (payload.success === true) {
                    state.notifications =
                        payload.data || [];
                }
            },
        );
    },
});

export default NotificationSlice.reducer;
