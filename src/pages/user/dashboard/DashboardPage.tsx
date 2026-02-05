import { useMemo } from "react";
import { useAppSelector } from "../../../services/redux/Hooks";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { DashboardProgressView } from "../../../components/dashboard/DashboardProgressView";
import { DashboardCompleteView } from "../../../components/dashboard/DashboardCompleteView";

export const DashboardPage = () => {
    const user = useAppSelector((state) => state.user.user);

    const userLevel = useMemo(() => user?.level || 1, [user]);

    return (
        <Layout>
            <PageSeo
                title="Dashboard - CU Portal"
                description="Your personal dashboard to manage your academic journey at CU Portal"
            />

            {user && userLevel < 4 ? (
                <DashboardProgressView userLevel={userLevel} user={user} />
            ) : user ? (
                <DashboardCompleteView user={user} />
            ) : null}
        </Layout>
    );
};
