import { useEffect } from "react";
import { useRefreshTokenMutation } from "../services/apis/AuthenticateAPIs";
import { useAppDispatch, useAppSelector } from "../services/redux/Hooks";
import { setAccessToken, setLoading } from "../services/redux/reducers/UserReducer";
import { GetCookie, SetCookie } from "../utils/CookiesManager";
export default function useRefreshToken() {
    const dispatch = useAppDispatch();
    const [refreshTokenMutation] = useRefreshTokenMutation();
    const [access_token, isLoading] = useAppSelector((state) => [state.user.access_token, state.user.isLoading]);
    useEffect(() => {
        if(isLoading) return;
        (async () => {
            if(!access_token && GetCookie("refresh_token")){
                dispatch(setLoading(true));
                const response = await refreshTokenMutation(GetCookie("refresh_token")!).unwrap();
                dispatch(setLoading(false));
                if(response && response.status == "success" && response.data) {
                    SetCookie("access_token", response.data.access_token, response.data.access_expires_in);
                    dispatch(setAccessToken(response.data.access_token));
                }
            }
        })();
    }, [dispatch, refreshTokenMutation, access_token, isLoading]);
    return null;
}