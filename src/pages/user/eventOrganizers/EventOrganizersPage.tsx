import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import { useNavigate } from "react-router";
import styles from "./EventOrganizersPage.module.css";
import { useCallback, useState } from "react";
import { useLazyGetEventOrganizersQuery } from "../../../services/apis/user/EventOrganizerAPI";
import type { EventOrganizer } from "../../../types/entities/EventOrganizer";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";

export const EventsOrganizersPage = () => {
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState<EventOrganizer[]>([]);
  const [getEventOrganizers] = useLazyGetEventOrganizersQuery();

  const fetchOrganizers = useCallback(async () => {
    try {
      const result = await getEventOrganizers({}).unwrap();
      setOrganizers(result.data || []);
    } catch (error) {
      handlePopupErrors(error);
    }
  }, [getEventOrganizers]);

  useAuthQuery(fetchOrganizers);

  const handleViewOrganizer = (organizerId?: number) => {
    if (!organizerId) return;
    navigate(`/user/events-organizers/${organizerId}`);
  };

  return (
    <Layout>
      <PageSeo
        title="Event Organizers  - CU Portal"
        description="Events organizers page and their details"
      />
      <Banner
        title="Event Organizers "
        description="Events organizers page and their details"
      />
      <div className={styles["cards-grid"]}>
        {organizers.length > 0 ? (
          organizers.map((org) => (
            <Card
              key={org.id}
              title="Event Organizer"
              profile={org.name || "Unnamed organizer"}
              profileLogo={org.logo}
              items={[
                {
                  icon: "calendar",
                  label: "Events",
                  value: String(org.events_count ?? 0),
                  color: "green",
                },
                {
                  icon: "sidebar-admin-users",
                  label: "Total Attendees",
                  value: String(org.total_attendees ?? 0),
                  color: "yellow",
                },
              ]}
              button="View Details"
              buttonAction={() => handleViewOrganizer(org.id)}
            />
          ))
        ) : (
          <div className={styles["no-data"]}>No Event Organizers found</div>
        )}
      </div>
    </Layout>
  );
};
