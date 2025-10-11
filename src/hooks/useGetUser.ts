import { useEffect } from "react";
import { setUser } from "../services/redux/reducers/UserReducer";
import { useGetUserDataQuery } from "../services/apis/UserAPIs";
import { useAppDispatch, useAppSelector } from "../services/redux/Hooks";
import type { RootState } from "../services/redux/Store";

export default function useGetUser() {
    const dispatch = useAppDispatch();
    const access_token = useAppSelector((state: RootState) => state.user.access_token);
    const { data } = useGetUserDataQuery(access_token!, { skip: !access_token });
    useEffect(() => {
        if (data && data.status == "success" && data.data) {
            dispatch(setUser(data.data));
        }
    }, [dispatch, data]);
    return null;
}
