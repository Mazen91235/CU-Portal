import { Layout } from "../../../components/layout/Layout";
import { usePageLoading } from "../../../hooks/usePageLoading";

export const Dashboard = () => {
    usePageLoading(true);
    return (
        <Layout>
            <div>User Dashboard</div>
        </Layout>
    );
};
