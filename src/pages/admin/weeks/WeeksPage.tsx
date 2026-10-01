import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { buildRedirectUrl } from "../../../utils/Navigation";
import { Banner } from "../../../components/banner/Banner";
import { Card } from "../../../components/card/Card";
import { DateFilter } from "../../../components/forms/DateFilter";
import { Layout } from "../../../components/layout/Layout";
import { NoContentSection } from "../../../components/section/NoContentSection";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { PageSeo } from "../../../components/PageSeo";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import {
    useDeleteWeekMutation,
    useLazyGetWeeksQuery,
} from "../../../services/apis/admin/WeekAPIs";
import type { WeekResponseDto } from "../../../types/dtos/WeekDtos";
import {
    formatDate,
    formatDateTime,
    toIsoFormat,
} from "../../../utils/Formatter";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import styles from "./WeeksPage.module.css";

const getWeekEndDate = (startDate?: string | null) => {
    if (!startDate) return null;
    const date = new Date(formatDateTime(startDate, true));
    date.setUTCDate(date.getUTCDate() + 6);
    return date.toISOString().slice(0, 10);
};

const getTodayKey = () =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });

const isCurrentWeek = (week: WeekResponseDto) => {
    if (!week.start_date) return false;
    const startKey = formatDateTime(week.start_date, true).slice(0, 10);
    const endKey = getWeekEndDate(week.start_date);
    const todayKey = getTodayKey();
    return Boolean(endKey && todayKey >= startKey && todayKey <= endKey);
};

export function WeeksPage() {
    const navigate = useNavigate();
    const [weeks, setWeeks] = useState<WeekResponseDto[]>([]);
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const dateFrom = getFilter("date_from", "");
    const setDateFrom = getFilterSetter("date_from", true);
    const dateTo = getFilter("date_to", "");
    const setDateTo = getFilterSetter("date_to", true);
    const [weekToDelete, setWeekToDelete] = useState<WeekResponseDto | null>(
        null,
    );
    const [getWeeks, { isFetching }] = useLazyGetWeeksQuery();
    const [deleteWeek] = useDeleteWeekMutation();

    const fetch = useCallback(async () => {
        try {
            const result = await getWeeks({
                data: {
                    start_date_from: toIsoFormat(dateFrom),
                    start_date_to: toIsoFormat(dateTo),
                },
                order_by: ["start_date"],
                descending: false,
                limit: 1e6,
            }).unwrap();

            const fetchedWeeks = result.data || [];
            setWeeks(fetchedWeeks);
        } catch (error) {
            console.error("Error fetching weeks:", error);
            handlePopupErrors(error);
        }
    }, [getWeeks, dateFrom, dateTo]);

    const authWeeksQuery = useCallback(() => fetch(), [fetch]);

    useAuthQuery(authWeeksQuery);

    const removeWeek = async () => {
        if (!weekToDelete?.id) return;
        try {
            await deleteWeek({ week_id: weekToDelete.id }).unwrap();
            showToast("success", "Success", "Week deleted successfully");
            setWeekToDelete(null);
            await fetch();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Weeks Management - CU Portal"
                description="Manage weeks"
            />
            <Banner
                title="Weeks Management"
                description="Manage weeks"
                button="Create Weeks"
                buttonAction={() => navigate("/admin/weeks/create")}
            />
            <main className={styles.container}>
                <div className={styles.filtersContainer}>
                    <div className={styles.filtersRow}>
                        <DateFilter
                            placeholder="Date From"
                            setValue={setDateFrom}
                            value={dateFrom}
                        />
                        <DateFilter
                            placeholder="Date To"
                            setValue={setDateTo}
                            value={dateTo}
                            startDay={false}
                        />
                    </div>
                </div>
                <div className={styles.weeksGrid}>
                    {weeks.map((week) => (
                        <Card
                            key={week.id}
                            title={`Week ${week.week_number ?? ""}`}
                            secondaryBadge={
                                isCurrentWeek(week) ? "Current" : undefined
                            }
                            items={[
                                {
                                    icon: "calendar",
                                    label: "Start date",
                                    value: formatDate(week.start_date),
                                },
                                {
                                    icon: "calendar",
                                    label: "End date",
                                    value: formatDate(
                                        getWeekEndDate(week.start_date),
                                    ),
                                },
                            ]}
                            button="View Week"
                            buttonAction={() =>
                                navigate(
                                    buildRedirectUrl(`/admin/weeks/${week.id}`),
                                )
                            }
                            hasOptions
                            editable
                            onEdit={() =>
                                navigate(
                                    buildRedirectUrl(
                                        `/admin/weeks/edit/${week.id}`,
                                    ),
                                )
                            }
                            deletable
                            onDelete={() => setWeekToDelete(week)}
                        />
                    ))}
                </div>
                {weeks.length === 0 && !isFetching && (
                    <NoContentSection icon="calendar" label="No weeks found" />
                )}
            </main>
            <ConfirmModal
                isOpen={weekToDelete !== null}
                onClose={() => setWeekToDelete(null)}
                onConfirm={removeWeek}
                confirmText="Delete"
                title="Delete this week?"
                message="This will remove the selected week from the weekly guide."
                colorType="red"
            />
        </Layout>
    );
}
