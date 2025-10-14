import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/UserReducer";
import { AuthenticateAPI } from "../apis/AuthenticateAPIs";
import { UserAPI } from "../apis/UserAPIs";
import { setupListeners } from "@reduxjs/toolkit/query";
import { NotificationAPI } from "../apis/NotificationAPIs";

const store = configureStore({
    reducer: {
        user: userReducer,
        [AuthenticateAPI.reducerPath]: AuthenticateAPI.reducer,
        [UserAPI.reducerPath]: UserAPI.reducer,
        [NotificationAPI.reducerPath]: NotificationAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            AuthenticateAPI.middleware,
            UserAPI.middleware,
            NotificationAPI.middleware
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
