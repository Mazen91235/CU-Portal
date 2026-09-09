import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { SubBanner } from "../../../components/banner/SubBanner";
import { StatCard } from "../../../components/card/StatCard";
import { GetIcon } from "../../../utils/LinkHandler";
// import { Card } from "../../../components/card/Card";
import styles from "./EventOrganizerPage.module.css";
import { Heading } from "../../../components/heading/Heading";
import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useLazyGetEventOrganizerQuery } from "../../../services/apis/admin/EventOrganizerAPI";
import type { EventOrganizer } from "../../../types/entities/EventOrganizer";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
export const EventOrganizerPage = () => {
  const navigate = useNavigate();
  const { organizerId } = useParams<{ organizerId: string }>();
  const [organizer, setOrganizer] = useState<EventOrganizer | null>(null);
  const [getEventOrganizer] = useLazyGetEventOrganizerQuery();

  const fetchOrganizer = useCallback(async () => {
    if (!organizerId) return;
    try {
      const result = await getEventOrganizer({
        event_organizer_id: Number(organizerId),
      }).unwrap();
      setOrganizer(result.data || null);
    } catch (error) {
      handlePopupErrors(error);
    }
  }, [getEventOrganizer, organizerId]);

  useAuthQuery(fetchOrganizer);

  const organizerStats = {
    totalEvents: organizer?.events_count ?? 0,
    totalAttendees: organizer?.total_attendees ?? 0,
  };

  const organizerInfo = {
    name: organizer?.name || "Event Organizer",
    logo: organizer?.logo,
  };
  const quickLinks = (organizer?.attached_links || []).map((link) => {
    const [label, url] = link.split("|").map((part) => part.trim());
    const color =
      label?.toLowerCase() === "twitter"
        ? "black"
        : label?.toLowerCase() === "facebook"
          ? "blue"
          : label?.toLowerCase() === "instagram"
            ? "instagram"
            : "default";
    return { label: label || "Link", url: url || "#", color };
  });
  return (
    <Layout>
      <PageSeo
        title="Event Organizer Details - CU Portal"
        description="View organizer details ,quick links and managed events"
      />
      <SubBanner
        title="Event Organizer Details"
        description="View organizer details ,quick links and managed events"
        icon={GetIcon("user")}
        linkText="Back to Event Organizers"
        linkTo="/admin/eventsOrganizers"
        button="Edit Organizer"
        buttonAction={() => {
          // Navigate to edit page
          navigate(`/admin/eventsOrganizers/edit/${organizerId}`);
        }}
      />

      <main className={styles.container}>
        {/* Event Details Section */}
        <section className={styles.eventDetailsSection}>
          <div className={styles.statsGrid}>
            <Heading icon="calendar" content="Events Details" size="medium" />
            <div className={styles.statsCards}>
              <StatCard
                type="Events"
                value={organizerStats.totalEvents}
                icon="calendar"
              />

              <StatCard
                type="Total Attendees"
                value={organizerStats.totalAttendees}
                icon="people"
              />
            </div>
          </div>

          {/* Event Creator Card */}
          <div className={styles.creatorCard}>
            <h4 className={styles.creatorTitle}>Event Creator</h4>
            <div className={styles.creatorContent}>
              {organizerInfo.logo ? (
                <img
                  src={organizerInfo.logo}
                  alt={organizerInfo.name}
                  className={styles.logoImage}
                />
              ) : (
                <div className={styles.profileIcon}>
                  <span>{organizerInfo.name.slice(0, 1).toUpperCase()}</span>
                </div>
              )}

              <p className={styles.creatorName}>{organizerInfo.name}</p>
            </div>
          </div>
        </section>

        {/* Main Content Section */}
        <section className={styles.mainContent}>
          {/* Creator Events */}
          <div className={styles.eventsSection}>
            <h2 className={styles.sectionTitle}>Creator Events</h2>
            {/* <div className={styles.eventsGrid}>
              {creatorEvents.map((event) => (
                <Card
                  key={event.id}
                  title={event.title}
                  badge={event.badge}
                  items={[
                    {
                      icon: "calendar",
                      value: event.date,
                    },
                    {
                      icon: "time",
                      value: event.time,
                    },
                    {
                      icon: "location",
                      value: event.location,
                    },
                    {
                      icon: "users-assigned",
                      value: `${event.attendees} attendees`,
                    },
                  ]}
                />
              ))}
            </div> */}
          </div>

          {/* Quick Links */}
          <aside className={styles.sidebar}>
            <div className={styles.quickLinksCard}>
              <h3 className={styles.quickLinksTitle}>Quick Links</h3>
              <div className={styles.linksContainer}>
                {quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`${styles.linkButton} ${styles[`link-${link.color}`] ?? styles.linkDefault}`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </Layout>
  );
};
