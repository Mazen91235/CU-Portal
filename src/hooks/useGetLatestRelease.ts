import { useEffect } from "react";
import { useLazyGetReleasesQuery } from "../services/apis/user/ReleaseAPIs";
import { useAppDispatch, useAppSelector } from "../services/redux/Hooks";
import { setLatestRelease } from "../services/redux/reducers/ReleaseReducer";
import { useLogin } from "./useLogin";
import {
    LATEST_RELEASE_CACHE_DURATION,
    readLatestReleaseCache,
    isReleaseLater,
} from "../utils/LatestRelease";
import { validateCachedData } from "../utils/Validators";

let latestReleaseFetchPromise: Promise<unknown> | null = null;

export const useGetLatestRelease = () => {
    const dispatch = useAppDispatch();
    const latestRelease = useAppSelector(
        (state) => state.release.latestRelease,
    );
    const isProcessing = useAppSelector((state) => state.release.isProcessing);
    const [getLatestRelease] = useLazyGetReleasesQuery();
    const isLoggedIn = useLogin();

    useEffect(() => {
        let cancelled = false;

        const loadLatestRelease = async () => {
            const cached = readLatestReleaseCache();

            if (
                cached &&
                validateCachedData(
                    cached.last_fetched,
                    LATEST_RELEASE_CACHE_DURATION,
                )
            ) {
                if (
                    !latestRelease ||
                    isReleaseLater(cached.release, latestRelease)
                ) {
                    dispatch(setLatestRelease(cached.release));
                }
                return;
            }

            if (isProcessing) return;

            try {
                if (!(await isLoggedIn())) return;
                if (cancelled) return;

                if (!latestReleaseFetchPromise) {
                    latestReleaseFetchPromise = getLatestRelease({
                        data: {},
                        includes: ["release_version", "release_items"],
                        order_by: ["date"],
                        descending: true,
                        limit: 1,
                    })
                        .unwrap()
                        .finally(() => {
                            latestReleaseFetchPromise = null;
                        });
                }

                await latestReleaseFetchPromise;
            } catch {
                return;
            }
        };

        void loadLatestRelease();

        return () => {
            cancelled = true;
        };
    }, [dispatch, getLatestRelease, isLoggedIn, isProcessing, latestRelease]);

    return latestRelease;
};

export default useGetLatestRelease;
