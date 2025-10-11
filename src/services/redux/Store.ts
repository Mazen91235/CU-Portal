import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/UserReducer";
import { AuthenticateAPI } from "../apis/AuthenticateAPIs";
import { UserAPI } from "../apis/UserAPIs";
import { setupListeners } from "@reduxjs/toolkit/query";

const store = configureStore({
    reducer: {
        user: userReducer,
        [AuthenticateAPI.reducerPath]: AuthenticateAPI.reducer,
        [UserAPI.reducerPath]: UserAPI.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            AuthenticateAPI.middleware,
            UserAPI.middleware
        ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
