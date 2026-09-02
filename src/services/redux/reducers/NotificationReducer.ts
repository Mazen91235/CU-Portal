import { createSlice } from "@reduxjs/toolkit";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { NotificationAPI } from "../../apis/user/NotificationAPIs";
import type { NotificationResponseDto } from "../../../types/dtos/NotificationDtos";

const initialState = {
    notifications: [] as NotificationResponseDto[],
    hasMore: true,
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
                {
                    payload,
                }: { payload: GenericAPIResponse<NotificationResponseDto[]> },
            ) => {
                if (
                    payload.success === true &&
                    payload.data &&
                    !payload.data.some((n) => n.seen)
                ) {
                    state.notifications = payload.data || [];
                    state.hasMore = payload.next_page ?? false;
                }
            },
        );
    },
});

export default NotificationSlice.reducer;
