import { getRedirectUrl } from "../../../utils/Navigation";
import { useNavigate, useSearchParams } from "react-router";
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
import { useCreateWeekMutation } from "../../../services/apis/admin/WeekAPIs";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { showToast } from "../../../utils/ToastsManager";
import styles from "./WeekForm.module.css";

const weekSchema = z.object({
    week_number: z
        .number({ message: "Starting week number is required" })
        .int("Starting week number must be a whole number")
        .positive("Starting week number must be positive"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
});

type WeekFormData = z.infer<typeof weekSchema>;

const getWeeksCount = (start: string, end: string) => {
    if (!start || !end || end < start) return 0;
    const days =
        (new Date(`${end}T00:00:00Z`).getTime() -
            new Date(`${start}T00:00:00Z`).getTime()) /
            86400000 +
        1;
    return Math.ceil(days / 7);
};

export function CreateWeek() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = getRedirectUrl(
        searchParams.get("redirect_url"),
        "/admin/weeks",
    );
    const [createWeek, { isLoading }] = useCreateWeekMutation();
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors, isSubmitting },
    } = useForm<WeekFormData>({
        resolver: zodResolver(weekSchema),
        defaultValues: {
            week_number: 1,
        },
    });
    const startDate = watch("start_date");
    const endDate = watch("end_date");
    const weeksCount = getWeeksCount(startDate, endDate);

    const onSubmit = async (data: WeekFormData) => {
        try {
            for (let index = 0; index < weeksCount; index += 1) {
                const date = new Date(`${data.start_date}T00:00:00Z`);
                date.setUTCDate(date.getUTCDate() + index * 7);
                await createWeek({
                    week_number: data.week_number + index,
                    start_date: date.toISOString(),
                }).unwrap();
            }
            showToast(
                "success",
                "Created",
                `${weeksCount} week${weeksCount === 1 ? "" : "s"} created successfully`,
            );
            navigate(redirectUrl);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const busy = isLoading || isSubmitting;
    return (
        <Layout>
            <PageSeo
                title="Create Weeks - CU Portal"
                description="Create weeks"
            />
            <SubBanner
                title="Create Weeks"
                description="Create one or more weeks"
                linkText="Back to Weeks"
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
                        label="Starting Week Number"
                        register={register}
                        name="week_number"
                        type="number"
                        errors={errors}
                        registerOptions={{
                            setValueAs: (value) =>
                                value === "" ? undefined : Number(value),
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
                    <DateInput
                        label="End Date"
                        register={register}
                        name="end_date"
                        errors={errors}
                        setValue={setValue}
                        control={control}
                        disabled={busy}
                    />
                    <Input
                        label="Estimated Weeks"
                        type="number"
                        errors={{}}
                        value={weeksCount}
                        disabled
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
                            text="Create Weeks"
                            loadingText="Creating..."
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
