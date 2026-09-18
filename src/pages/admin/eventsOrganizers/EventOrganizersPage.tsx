import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { Card } from "../../../components/card/Card";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { buildRedirectUrl } from "../../../utils/Navigation";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import {
    useLazyGetEventOrganizersQuery,
    useDeleteEventOrganizerMutation,
} from "../../../services/apis/admin/EventOrganizerAPIs";
import type { EventOrganizerResponseDto } from "../../../types/dtos/EventOrganizerDtos";
import defaultEventOrganizerLogo from "../../../assets/default event organizer logo.jpg";

import styles from "./EventOrganizersPage.module.css";

export const EventOrganizersPage = () => {
    const navigate = useNavigate();
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [organizers, setOrganizers] = useState<EventOrganizerResponseDto[]>(
        [],
    );
    const [selectedOrganizer, setSelectedOrganizer] =
        useState<EventOrganizerResponseDto | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [getEventOrganizers, { isFetching }] =
        useLazyGetEventOrganizersQuery();
    const [deleteEventOrganizer, { isLoading: isDeleting }] =
        useDeleteEventOrganizerMutation();

    const fetchOrganizers = useCallback(async () => {
        if (!hasNextPage && page !== 1) return;
        try {
            const result = await getEventOrganizers({
                data: { query: searchQuery || undefined },
                includes: ["logo"],
                page,
            }).unwrap();
            setOrganizers((prev) => {
                if (page === 1) return result.data || [];
                const ids = new Set((result.data || []).map((item) => item.id));
                return [
                    ...prev.filter((item) => !ids.has(item.id)),
                    ...(result.data || []),
                ];
            });
            setHasNextPage(result.next_page || false);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getEventOrganizers, hasNextPage, page, searchQuery]);

    const authQueryParams = useCallback(
        () => fetchOrganizers(),
        [fetchOrganizers],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery]);

    const openDelete = (organizer: EventOrganizerResponseDto) => {
        setSelectedOrganizer(organizer);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedOrganizer?.id) return;
        try {
            await deleteEventOrganizer({
                event_organizer_id: selectedOrganizer.id,
            }).unwrap();
            showToast(
                "success",
                "Success",
                "Event organizer deleted successfully",
            );
            setDeleteOpen(false);
            setSelectedOrganizer(null);
            setPage(1);
            setHasNextPage(true);
            await fetchOrganizers();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Event Organizers - CU Portal"
                description="Manage event organizers"
            />
            <Banner
                title="Event Organizers"
                description="Manage event organizers"
                button="Add Organizer"
                buttonAction={() => navigate("/admin/event-organizers/create")}
            />
            <main className={styles.container}>
                <div className={styles.searchRow}>
                    <Search
                        placeholder="Search event organizers..."
                        setValue={setSearchQuery}
                        value={searchQuery}
                    />
                </div>
                <div className={styles.cardsGrid}>
                    {organizers.map((organizer) => (
                        <Card
                            key={organizer.id}
                            title="Event Organizer"
                            profile={organizer.name || "Unnamed organizer"}
                            profileLogo={organizer.logo?.url || defaultEventOrganizerLogo}
                            editable
                            deletable
                            hasOptions
                            onEdit={() =>
                                navigate(
                                    buildRedirectUrl(
                                        `/admin/event-organizers/edit/${organizer.id}`,
                                    ),
                                )
                            }
                            onDelete={() => openDelete(organizer)}
                            button="View Details"
                            buttonAction={() =>
                                navigate(
                                    `/admin/event-organizers/${organizer.id}`,
                                )
                            }
                        />
                    ))}
                </div>
                {organizers.length === 0 && !isFetching && (
                    <NoContentSection
                        icon="user"
                        label="No event organizers found"
                    />
                )}
                <Pagination
                    onReached={() => {
                        if (hasNextPage && !isFetching && organizers.length)
                            setPage((current) => current + 1);
                    }}
                />
            </main>
            <ConfirmModal
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Delete Organizer"
                message={`Are you sure you want to delete "${selectedOrganizer?.name}"? This action cannot be undone.`}
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                colorType="red"
            />
        </Layout>
    );
};
