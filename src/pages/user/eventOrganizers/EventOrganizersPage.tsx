import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Layout } from "../../../components/layout/Layout";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { Card } from "../../../components/card/Card";
import { Pagination } from "../../../components/pagination/Pagination";
import { NoContentSection } from "../../../components/section/NoContentSection";
import { useLazyGetEventOrganizersQuery } from "../../../services/apis/user/EventOrganizerAPIs";
import type { EventOrganizerResponseDto } from "../../../types/dtos/EventOrganizerDtos";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import styles from "./EventOrganizersPage.module.css";

export const EventsOrganizersPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [organizers, setOrganizers] = useState<EventOrganizerResponseDto[]>(
        [],
    );
    const [getEventOrganizers, { isFetching }] =
        useLazyGetEventOrganizersQuery();

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

    useAuthQuery(fetchOrganizers);
    useEffect(() => {
        setPage(1);
        setHasNextPage(true);
    }, [searchQuery]);

    return (
        <Layout>
            <PageSeo
                title="Event Organizers - CU Portal"
                description="Discover event organizers"
            />
            <Banner
                title="Event Organizers"
                description="Discover event organizers"
            />
            <main className={styles.container}>
                <div className={styles.searchRow}>
                    <Search
                        placeholder="Search event organizers..."
                        setValue={setSearchQuery}
                    />
                </div>
                <div className={styles.cardsGrid}>
                    {organizers.map((organizer) => (
                        <Card
                            key={organizer.id}
                            title="Event Organizer"
                            profile={organizer.name || "Unnamed organizer"}
                            profileLogo={organizer.logo?.url || undefined}
                            button="View Details"
                            buttonAction={() =>
                                navigate(
                                    `/user/event-organizers/${organizer.id}`,
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
        </Layout>
    );
};
