import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "../../../components/layout/Layout";
import { SubBanner } from "../../../components/banner/SubBanner";
import { PageSeo } from "../../../components/PageSeo";
import { Form } from "../../../components/forms/Form";
import { Input } from "../../../components/forms/Input";
import { DateInput } from "../../../components/forms/DateInput";
import { Button } from "../../../components/forms/Button";
import {
    useLazyGetWeekQuery,
    useUpdateWeekMutation,
} from "../../../services/apis/admin/WeekAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import { formatDateInputValue } from "../../../utils/Formatter";
import styles from "./WeekForm.module.css";

const weekSchema = z.object({
    week_number: z.string().min(1, "Week number is required"),
    start_date: z.string().min(1, "Start date is required"),
});
type WeekFormData = z.infer<typeof weekSchema>;

export function EditWeek() {
    const { weekId } = useParams<{ weekId: string }>();
    const navigate = useNavigate();
    const [getWeek] = useLazyGetWeekQuery();
    const [updateWeek, { isLoading }] = useUpdateWeekMutation();
    const [loadingWeek, setLoadingWeek] = useState(true);
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm<WeekFormData>({ resolver: zodResolver(weekSchema) });

    const fetchWeek = useCallback(async () => {
        if (!weekId) return;
        setLoadingWeek(true);
        try {
            const response = await getWeek({
                week_id: Number(weekId),
            }).unwrap();
            const week = response.data;
            if (!week) return;
            setValue("week_number", String(week.week_number ?? ""));
            setValue("start_date", formatDateInputValue(week.start_date || ""));
        } catch (error) {
            handlePopupErrors(error);
        } finally {
            setLoadingWeek(false);
        }
    }, [getWeek, setValue, weekId]);

    useEffect(() => {
        void fetchWeek();
    }, [fetchWeek]);

    const onSubmit = async (data: WeekFormData) => {
        if (!weekId) return;
        try {
            const response = await getWeek({
                week_id: Number(weekId),
            }).unwrap();
            const week = response.data;
            if (!week?.faculty?.id || !week.department?.id || !week.year?.id)
                return;
            await updateWeek({
                week_id: Number(weekId),
                week_number: Number(data.week_number),
                start_date: `${data.start_date}T00:00:00.000Z`,
                faculty_id: week.faculty.id,
                department_id: week.department.id,
                year_id: week.year.id,
            }).unwrap();
            showToast("success", "Saved", "Week updated successfully");
            navigate(`/admin/weeks/${weekId}`);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const busy = loadingWeek || isLoading || isSubmitting;
    return (
        <Layout>
            <PageSeo
                title="Edit Week - CU Portal"
                description="Update a weekly guide"
            />
            <SubBanner
                title="Edit Week"
                description="Update weekly guide information"
                linkText="Back to Week"
                linkTo={`/admin/weeks/${weekId}`}
            />
            <main className={styles.container}>
                <Form
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    disabled={busy}
                    className={styles.formCard}
                >
                    <Input
                        label="Week Number"
                        register={register}
                        name="week_number"
                        type="number"
                        errors={errors}
                        disabled={busy}
                    />
                    <DateInput
                        label="Start Date"
                        register={register}
                        name="start_date"
                        errors={errors}
                        setValue={setValue}
                        control={control}
                        disabled={busy}
                    />
                    <div className={styles.formActions}>
                        <Button
                            text="Cancel"
                            loadingText="Cancelling..."
                            type="button"
                            isSubmitting={false}
                            isSecondary
                            onClick={() => navigate(`/admin/weeks/${weekId}`)}
                        />
                        <Button
                            text="Save Week"
                            loadingText="Saving..."
                            type="submit"
                            isSubmitting={busy}
                            isOrange={false}
                        />
                    </div>
                </Form>
            </main>
        </Layout>
    );
}
