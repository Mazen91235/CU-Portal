import { useEffect } from "react";
import { useLazyGetUserDataQuery } from "../services/apis/UserAPIs";
import { useAppSelector } from "../services/redux/Hooks";

export default function useGetUser() {
    const access_token = useAppSelector((state) => state.user.access_token);
    const [getUserData, { data }] = useLazyGetUserDataQuery();
    useEffect(() => {
        if (access_token) {
            getUserData();
        }
    }, [access_token, getUserData]);
    return data;
}
