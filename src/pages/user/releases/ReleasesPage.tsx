import { Banner } from "../../../components/banner/Banner";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { ReleaseCard } from "../../../components/releases/ReleaseCard";
import { ReleaseCardHeader } from "../../../components/releases/ReleaseCardHeader";
import { VersionPicker } from "../../../components/releases/VersionPicker";
import { useLazyGetReleasesQuery } from "../../../services/apis/user/ReleaseAPIs";
import type { Release } from "../../../types/entities/Release";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { mapReleaseResponse } from "../../../utils/ReleaseHelpers";
import { NoContentSection } from "../../../components/section/NoContentSection";
import styles from "./ReleasesPage.module.css";

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
  const [releases, setReleases] = useState<Release[]>([]);
  const [getReleases] = useLazyGetReleasesQuery();

  const fetchReleases = useCallback(async () => {
    try {
      const result = await getReleases({
        data: {},
        order_by: ["date"],
        descending: true,
        limit: 1000,
      }).unwrap();
      setReleases((result.data ?? []).map(mapReleaseResponse));
    } catch (error) {
      handlePopupErrors(error);
    }
  }, [getReleases]);

  useAuthQuery(fetchReleases);

  const latestRelease = useMemo(
    () =>
      releases.reduce<Release | null>(
        (latest, release) =>
          !latest || (release.date ?? "") > (latest.date ?? "")
            ? release
            : latest,
        null,
      ),
    [releases],
  );

  const releasesWithoutLatest = useMemo(
    () => releases.filter((release) => release.id !== latestRelease?.id),
    [latestRelease?.id, releases],
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
      {latestRelease && (
        <ReleaseCardHeader
          release={latestRelease}
          onViewAllReleases={() =>
            navigate(`/user/system/releases/${latestRelease.id}`)
          }
        />
      )}

      <div className={styles.container}>
        <div className={styles.filtersContainer}>
          <VersionPicker
            versions={versionOptions}
            value={versionFilter}
            onVersionChange={setVersionFilter}
          />
        </div>
        <div className={styles.timeline}>
          {releaseGroups.length > 0 ? (
            releaseGroups.map(([version, dateGroups]) => (
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
            ))
          ) : (
            <div className={styles.emptyState}>
              <NoContentSection
                icon="file-text"
                label={
                  releases.length
                    ? "No releases match the selected version"
                    : "No releases found"
                }
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
