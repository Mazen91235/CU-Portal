import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { getRedirectUrl } from "../../../utils/Navigation";
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
import { getErrorMessage, handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import { formatDateInputValue } from "../../../utils/Formatter";
import styles from "./WeekForm.module.css";

const weekSchema = z.object({
    week_number: z.number({ message: "Week number is required" }).int("Week number must be a whole number").positive("Week number must be positive"),
    start_date: z.string().min(1, "Start date is required"),
});
type WeekFormData = z.infer<typeof weekSchema>;

export function EditWeek() {
    const { weekId } = useParams<{ weekId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = getRedirectUrl(searchParams.get("redirect_url"), "/admin/weeks");
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
            if (!week) {
                navigate(redirectUrl, {
                    state: { error: "Failed to fetch week" },
                });
                return;
            }
            setValue("week_number", week.week_number ?? 1);
            setValue("start_date", formatDateInputValue(week.start_date || ""));
        } catch (error) {
            navigate(redirectUrl, {
                state: { error: getErrorMessage(error) || "Failed to fetch week" },
            });
        } finally {
            setLoadingWeek(false);
        }
    }, [getWeek, navigate, redirectUrl, setValue, weekId]);

    useEffect(() => {
        void fetchWeek();
    }, [fetchWeek]);

    const onSubmit = async (data: WeekFormData) => {
        if (!weekId) return;
        try {
            await updateWeek({
                week_id: Number(weekId),
                week_number: data.week_number,
                start_date: `${data.start_date}T00:00:00.000Z`,
            }).unwrap();
            showToast("success", "Saved", "Week updated successfully");
            navigate(redirectUrl);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const busy = loadingWeek || isLoading || isSubmitting;
    return (
        <Layout>
            <PageSeo
                title="Edit Week - CU Portal"
                description="Update a weeks"
            />
            <SubBanner
                title="Edit Week"
                description="Update week information"
                linkText="Back to Week"
                linkTo={redirectUrl}
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
                        registerOptions={{
                            setValueAs: (value) => value === "" ? undefined : Number(value),
                        }}
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
                            onClick={() => navigate(redirectUrl)}
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
