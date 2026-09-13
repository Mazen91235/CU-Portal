import { Banner } from "../../../components/banner/Banner";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { ReleaseCard } from "../../../components/releases/ReleaseCard";
import { ReleaseCardHeader } from "../../../components/releases/ReleaseCardHeader";
import { VersionPicker } from "../../../components/releases/VersionPicker";
import type { Release } from "../../../types/entities/Release";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import styles from "./ReleasesPage.module.css";
const fakeReleases: Release[] = [
  {
    id: 1,
    title: "CU Portal v1.0.0",
    date: "2024-06-01",
    description:
      "Initial release of CU Portal with core features and improvements.",
    release_number: "v1.0.0",
    release_items: [
      ...Array.from({ length: 5 }, () => ({ item_type: "Feature" as const })),
      ...Array.from({ length: 3 }, () => ({ item_type: "Bug Fix" as const })),
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
  },
  {
    id: 2,
    title: "Infrastructure Resilience Update",
    date: "2024-09-12",
    description:
      "Major improvements to database clustering and auto-scaling for busy periods.",
    release_number: "v1.1.0",
    release_items: [
      ...Array.from({ length: 2 }, () => ({ item_type: "Feature" as const })),
      ...Array.from({ length: 3 }, () => ({
        item_type: "Improvement" as const,
      })),
      { item_type: "Security Fix" as const },
    ],
  },
  {
    id: 3,
    title: "Faster Materials and Search",
    date: "2025-02-18",
    description:
      "Improved material loading, search results, and navigation across courses.",
    release_number: "v1.2.0",
    release_items: [
      ...Array.from({ length: 4 }, () => ({ item_type: "Feature" as const })),
      ...Array.from({ length: 2 }, () => ({ item_type: "Bug Fix" as const })),
      ...Array.from({ length: 2 }, () => ({
        item_type: "Refactoring" as const,
      })),
    ],
  },
  {
    id: 4,
    title: "Account Security Improvements",
    date: "2025-08-05",
    description:
      "Strengthened account protection and simplified the sign-in experience.",
    release_number: "v1.3.0",
    release_items: [
      ...Array.from({ length: 3 }, () => ({
        item_type: "Security Fix" as const,
      })),
      ...Array.from({ length: 2 }, () => ({ item_type: "Bug Fix" as const })),
      { item_type: "Improvement" as const },
    ],
  },
  {
    id: 5,
    title: "Faster Materials and Search 2",
    date: "2025-02-18",
    description:
      "Improved material loading, search results, and navigation across courses.",
    release_number: "v1.2.1",
    release_items: [
      ...Array.from({ length: 2 }, () => ({ item_type: "Bug Fix" as const })),
      ...Array.from({ length: 2 }, () => ({
        item_type: "Refactoring" as const,
      })),
    ],
  },
  {
    id: 6,
    title: "Faster Materials and Search 3",
    date: "2025-02-18",
    description:
      "Improved material loading, search results, and navigation across courses.",
    release_number: "v2.0.0",
    release_items: [
      ...Array.from({ length: 2 }, () => ({ item_type: "Bug Fix" as const })),
      ...Array.from({ length: 2 }, () => ({
        item_type: "Refactoring" as const,
        ...Array.from({ length: 3 }, () => ({
          item_type: "Security Fix" as const,
        })),
      })),
    ],
  },
];

const getMajorVersion = (release: Release) => {
  const match = release.release_number?.match(/v?(\d+)/i);
  return match?.[1] ?? "0";
};

const parseVersionParts = (release: Release): number[] =>
  (release.release_number ?? "")
    .replace(/^v/i, "")
    .split(".")
    .map((part) => Number(part) || 0);

const compareVersionsDescending = (a: Release, b: Release): number => {
  const versionA = parseVersionParts(a);
  const versionB = parseVersionParts(b);
  const length = Math.max(versionA.length, versionB.length);

  for (let i = 0; i < length; i++) {
    const diff = (versionB[i] ?? 0) - (versionA[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

const getTimelineDateLabel = (date?: string) => {
  if (!date) return "-";
  const [year, month, day] = date.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  return `${parsedDate.getDate()} ${parsedDate.toLocaleString("en-US", { month: "short" })}`;
};

type ReleaseDateGroup = {
  date: string;
  releases: Release[];
};

export function ReleasesPage() {
  const navigate = useNavigate();
  const [versionFilter, setVersionFilter] = useState("");

  const latestRelease = useMemo(
    () =>
      fakeReleases.reduce((latest, release) =>
        (release.date ?? "") > (latest.date ?? "") ? release : latest,
      ),
    [],
  );

  const releasesWithoutLatest = useMemo(
    () => fakeReleases.filter((release) => release.id !== latestRelease.id),
    [latestRelease.id],
  );

  const versionOptions = useMemo(
    () =>
      Array.from(
        new Set(
          releasesWithoutLatest.map((release) => getMajorVersion(release)),
        ),
      )
        .sort((first, second) => Number(second) - Number(first))
        .map((version) => ({ value: version, label: `V${version}` })),
    [releasesWithoutLatest],
  );

  const releaseGroups = useMemo(() => {
    const groups = new Map<string, Map<string, Release[]>>();

    releasesWithoutLatest
      .filter(
        (release) =>
          !versionFilter || getMajorVersion(release) === versionFilter,
      )
      .sort((first, second) => {
        const dateDiff = (second.date ?? "").localeCompare(first.date ?? "");
        if (dateDiff !== 0) return dateDiff;
        return compareVersionsDescending(first, second);
      })
      .forEach((release) => {
        const version = getMajorVersion(release);
        const date = release.date ?? "";
        const dateGroups = groups.get(version) ?? new Map<string, Release[]>();
        dateGroups.set(date, [...(dateGroups.get(date) ?? []), release]);
        groups.set(version, dateGroups);
      });

    return Array.from(groups.entries())
      .sort(([first], [second]) => Number(second) - Number(first))
      .map(
        ([version, dateGroups]) =>
          [
            version,
            Array.from(dateGroups.entries())
              .sort(([first], [second]) => second.localeCompare(first))
              .map(([date, releases]) => ({ date, releases })),
          ] as [string, ReleaseDateGroup[]],
      );
  }, [releasesWithoutLatest, versionFilter]);

  return (
    <Layout>
      <PageSeo
        title="Releases - CU Portal"
        description="Browse and access the latest releases of CU Portal"
      />
      <Banner
        title="Releases"
        description="Browse and access the latest releases of CU Portal"
      />
      <ReleaseCardHeader
        release={latestRelease}
        onViewAllReleases={() => navigate("/user/system/releases/1")}
      />

      <div className={styles.container}>
        <div className={styles.filtersContainer}>
          <VersionPicker
            versions={versionOptions}
            value={versionFilter}
            onVersionChange={setVersionFilter}
          />
        </div>
        <div className={styles.timeline}>
          {releaseGroups.map(([version, dateGroups]) => (
            <section className={styles.versionGroup} key={version}>
              <div className={styles.versionHeading}>
                <div />
                <div className={styles.timelineMarker}>
                  <span className={styles.timelineDot} />
                </div>
                <h2 className={styles.versionTitle}>V{version}</h2>
              </div>
              {dateGroups.map(({ date, releases }) => (
                <article
                  className={styles.timelineRelease}
                  key={`${version}-${date}`}
                >
                  <div className={styles.timelineDate}>
                    {getTimelineDateLabel(date)}
                  </div>
                  <div className={styles.timelineMarker}>
                    <span className={styles.timelineDot} />
                  </div>
                  <div className={styles.timelineCard}>
                    {releases.map((release) => (
                      <ReleaseCard
                        key={release.id}
                        release={release}
                        onViewDetails={() =>
                          navigate(`/user/system/releases/${release.id}`)
                        }
                      />
                    ))}
                  </div>
                </article>
              ))}
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
