import { useState, useCallback } from "react";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { showToast } from "../../../utils/ToastsManager";
import { useNavigate } from "react-router";
import styles from "./EventOrganizersPage.module.css";
import {
  useLazyGetEventOrganizersQuery,
  useDeleteEventOrganizerMutation,
} from "../../../services/apis/admin/EventOrganizerAPI";
import type { EventOrganizer } from "../../../types/entities/EventOrganizer";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";

export const EventOrganizersPage = () => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState<EventOrganizer | null>(
    null,
  );
  const [organizers, setOrganizers] = useState<EventOrganizer[]>([]);
  const [getEventOrganizers] = useLazyGetEventOrganizersQuery();
  const [deleteEventOrganizer, { isLoading: isDeleting }] =
    useDeleteEventOrganizerMutation();

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
    navigate(`/admin/eventsOrganizers/${organizerId}`);
  };

  const handleDeleteClick = (organizer: EventOrganizer) => {
    setSelectedOrganizer(organizer);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrganizer?.id) return;

    try {
      await deleteEventOrganizer({
        event_organizer_id: selectedOrganizer.id,
      }).unwrap();
      showToast("success", "Success", "Organizer deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedOrganizer(null);
      await fetchOrganizers();
    } catch (error) {
      handlePopupErrors(error);
    }
  };

  return (
    <Layout>
      <PageSeo
        title="Event Organizers  - CU Portal"
        description="Manage organizers and see how many events each one owns"
      />
      <Banner
        title="Event Organizers "
        description="Manage organizers and see how many events each one owns"
        button="Add Organizer"
        buttonAction={() => {
          navigate("/admin/eventsOrganizers/create");
        }}
      />
      <div className={styles["cards-grid"]}>
        {organizers.length > 0 ? (
          organizers.map((org) => (
            <Card
              key={org.id}
              title="Event Organizer"
              profile={org.name || "Unnamed organizer"}
              profileLogo={org.logo} // Use the avatarSrc state for the profile logo
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
              editable
              deletable
              hasOptions
              onEdit={() => {
                navigate(`/admin/eventsOrganizers/edit/${org.id}`);
              }}
              onDelete={() => handleDeleteClick(org)}
              button="View Details"
              buttonAction={() => handleViewOrganizer(org.id)}
            />
          ))
        ) : (
          <div className={styles["no-data"]}>No Event Organizers found</div>
        )}
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Organizer"
        message={`Are you sure you want to delete "${selectedOrganizer?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        colorType="red"
      />
    </Layout>
  );
};
