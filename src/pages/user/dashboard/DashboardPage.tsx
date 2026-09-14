import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { DashboardProgressView } from "../../../components/dashboard/DashboardProgressView";
import { DashboardCompleteView } from "../../../components/dashboard/DashboardCompleteView";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../services/redux/Hooks";
import { useReleaseDismissal } from "../../../hooks/useReleaseDismissal";
import { RELEASE_DISMISSAL_STORAGE_KEY } from "../../../utils/ReleaseDismissal";
import { ReleasesBanner } from "../../../components/releases/ReleasesBanner";
import { useLazyGetReleasesQuery } from "../../../services/apis/user/ReleaseAPIs";
import type { ReleaseResponseDto } from "../../../types/dtos/ReleaseDtos";
import { useCallback, useState } from "react";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";

export const DashboardPage = () => {
    const user = useAppSelector((state) => state.user.user);
    const userLevel = user?.level || 1;
    const navigate = useNavigate();
    const [latestRelease, setLatestRelease] =
        useState<ReleaseResponseDto | null>(null);
    const [getReleases] = useLazyGetReleasesQuery();

    const fetchLatestRelease = useCallback(async () => {
        try {
            const result = await getReleases({
                data: {},
                includes: ["release_version", "release_items"],
                order_by: ["date"],
                descending: true,
                limit: 1,
            }).unwrap();
            const release = result.data?.[0];
            setLatestRelease(release ?? null);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getReleases]);

    useAuthQuery(fetchLatestRelease);

    const { isVisible: showLatestRelease, dismiss: handleReleaseClose } =
        useReleaseDismissal(
            RELEASE_DISMISSAL_STORAGE_KEY,
            latestRelease?.release_number ??
                latestRelease?.release_version?.version_number?.toString() ??
                "",
        );

    return (
        <Layout>
            <PageSeo title="Dashboard - CU Portal" description="..." />
            {showLatestRelease && latestRelease && (
                <ReleasesBanner
                    release={latestRelease}
                    onClose={handleReleaseClose}
                    onViewAllReleases={() => navigate("/user/system/releases")}
                />
            )}
            {user && userLevel < 4 ? (
                <DashboardProgressView userLevel={userLevel} user={user} />
            ) : user ? (
                <DashboardCompleteView user={user} />
            ) : null}
        </Layout>
    );
};
