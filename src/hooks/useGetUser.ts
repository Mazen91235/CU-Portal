import { useGetUserDataQuery } from "../services/apis/UserAPIs";
import { useAppSelector } from "../services/redux/Hooks";
import type { RootState } from "../services/redux/Store";

export default function useGetUser() {
    const access_token = useAppSelector((state: RootState) => state.user.access_token);
    useGetUserDataQuery(access_token!, { skip: !access_token });
    return null;
}
