// import { useMemo } from "react";
// import { useAppSelector } from "../../../services/redux/Hooks";
// import { PageSeo } from "../../../components/PageSeo";
// import { Layout } from "../../../components/layout/Layout";
// import { DashboardProgressView } from "../../../components/dashboard/DashboardProgressView";
// import { DashboardCompleteView } from "../../../components/dashboard/DashboardCompleteView";
// import { ReleasesBanner } from "../../../components/releases/ReleasesBanner";
// import { useNavigate } from "react-router";

// const latestRelease = {
//   title: "CU Portal v1.0.0",
//   date: "2024-06-01",
//   release_number: "v1.0.0",
//   release_items: [
//     ...Array.from({ length: 5 }, () => ({
//       item_type: "Feature" as const,
//     })),
//     ...Array.from({ length: 3 }, () => ({
//       item_type: "Bug Fix" as const,
//     })),
//     ...Array.from({ length: 3 }, () => ({
//       item_type: "Security Fix" as const,
//     })),
//     ...Array.from({ length: 3 }, () => ({
//       item_type: "Refactoring" as const,
//     })),
//     ...Array.from({ length: 3 }, () => ({
//       item_type: "Improvement" as const,
//     })),
//   ],
// };

// export const DashboardPage = () => {
//   const user = useAppSelector((state) => state.user.user);

//   const userLevel = useMemo(() => user?.level || 1, [user]);

//   const navigate = useNavigate();

//   return (
//     <Layout>
//       <PageSeo
//         title="Dashboard - CU Portal"
//         description="Your personal dashboard to manage your academic journey at CU Portal"
//       />
//       <ReleasesBanner
//         release={latestRelease}
//         onClose={() => console.log("Close banner")}
//         onViewAllReleases={() => navigate("/user/system/releases")}
//       />
//       {user && userLevel < 4 ? (
//         <DashboardProgressView userLevel={userLevel} user={user} />
//       ) : user ? (
//         <DashboardCompleteView user={user} />
//       ) : null}
//     </Layout>
//   );
// };

import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { DashboardProgressView } from "../../../components/dashboard/DashboardProgressView";
import { DashboardCompleteView } from "../../../components/dashboard/DashboardCompleteView";
import { useNavigate } from "react-router";
import { useAppSelector } from "../../../services/redux/Hooks";
import { useReleaseDismissal } from "../../../hooks/useReleaseDismissal";
import { RELEASE_DISMISSAL_STORAGE_KEY } from "../../../utils/releaseDismissal";
import { ReleasesBanner } from "../../../components/releases/ReleasesBanner";

const latestRelease = {
  title: "CU Portal v1.0.0",
  date: "2024-06-01",
  release_number: "v1.0.0",
  release_items: [
    ...Array.from({ length: 5 }, () => ({
      item_type: "Feature" as const,
    })),
    ...Array.from({ length: 3 }, () => ({
      item_type: "Bug Fix" as const,
    })),
    ...Array.from({ length: 3 }, () => ({
      item_type: "Security Fix" as const,
    })),
    ...Array.from({ length: 3 }, () => ({
      item_type: "Refactoring" as const,
    })),
    ...Array.from({ length: 3 }, () => ({
      item_type: "Improvement" as const,
    })),
  ],
};

export const DashboardPage = () => {
  const user = useAppSelector((state) => state.user.user);
  const userLevel = user?.level || 1;
  const navigate = useNavigate();

  const { isVisible: showLatestRelease, dismiss: handleReleaseClose } =
    useReleaseDismissal(
      RELEASE_DISMISSAL_STORAGE_KEY,
      latestRelease.release_number,
    );

  return (
    <Layout>
      <PageSeo title="Dashboard - CU Portal" description="..." />
      {showLatestRelease && (
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
