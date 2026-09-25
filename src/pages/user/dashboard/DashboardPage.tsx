import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { DashboardProgressView } from "../../../components/dashboard/DashboardProgressView";
import { DashboardCompleteView } from "../../../components/dashboard/DashboardCompleteView";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../services/redux/Hooks";
import { useReleaseDismissal } from "../../../hooks/useReleaseDismissal";
import useGetLatestRelease from "../../../hooks/useGetLatestRelease";
import { RELEASE_DISMISSAL_STORAGE_KEY } from "../../../utils/ReleaseDismissal";
import { ReleasesBanner } from "../../../components/releases/ReleasesBanner";

export const DashboardPage = () => {
    const user = useAppSelector((state) => state.user.user);
    const userLevel = user?.level || 1;
    const navigate = useNavigate();
    const latestRelease = useGetLatestRelease();

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
            {user && userLevel < 4 ? (
                <DashboardProgressView userLevel={userLevel} user={user} />
            ) : user ? (
                <>
                    {showLatestRelease && latestRelease && (
                        <ReleasesBanner
                            release={latestRelease}
                            onClose={handleReleaseClose}
                            onViewAllReleases={() =>
                                navigate("/user/system/releases")
                            }
                        />
                    )}
                    <DashboardCompleteView user={user} />
                </>
            ) : null}
        </Layout>
    );
};
