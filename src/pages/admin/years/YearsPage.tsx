import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetYearsQuery,
    useCreateYearMutation,
    useUpdateYearMutation,
    useDeleteYearMutation,
} from "../../../services/apis/admin/YearAPIs";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import { showToast } from "../../../utils/ToastsManager";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Card } from "../../../components/card/Card";
import { FloatingForm } from "../../../components/forms/FloatingForm";
import { Input } from "../../../components/forms/Input";
import { Button } from "../../../components/forms/Button";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import styles from "./YearsPage.module.css";
import { Layout } from "../../../components/layout/Layout";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";

const yearSchema = z.object({
    year: z
        .string()
        .min(1, "Year is required")
        .refine((val) => !isNaN(Number(val)), "Must be a valid year")
        .refine(
            (val) => Number(val) >= 2000 && Number(val) <= 2100,
            "Year must be between 2000 and 2100",
        ),
});

type YearFormData = z.infer<typeof yearSchema>;

export const YearsPage = () => {
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const yearFilter = getFilter("year_id", "");
    const setYearFilter = getFilterSetter("year_id");
    const [years, setYears] = useState<YearResponseDto[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<YearResponseDto | null>(
        null,
    );
    const [editMode, setEditMode] = useState(false);

    const [getYears] = useLazyGetYearsQuery();
    const [createYear, { isLoading: isCreating }] = useCreateYearMutation();
    const [updateYear, { isLoading: isUpdating }] = useUpdateYearMutation();
    const [deleteYear, { isLoading: isDeleting }] = useDeleteYearMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<YearFormData>({
        resolver: zodResolver(yearSchema),
    });

    const fetchYears = useCallback(async () => {
        try {
            const result = await getYears({ limit: 1e6 }).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getYears]);

    useAuthQuery(fetchYears);

    const filteredYears = useMemo(
        () =>
            years.filter((year) =>
                !yearFilter ? true : year.year?.toString() === yearFilter,
            ),
        [years, yearFilter],
    );

    const handleOpenForm = (year?: YearResponseDto) => {
        if (year) {
            setEditMode(true);
            setSelectedYear(year);
            reset({ year: year.year?.toString() || "" });
        } else {
            setEditMode(false);
            setSelectedYear(null);
            reset({ year: "" });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditMode(false);
        setSelectedYear(null);
        reset({ year: "" });
    };

    const onSubmit = async (data: YearFormData) => {
        try {
            const yearData = { year: parseInt(data.year) };

            if (editMode && selectedYear?.id) {
                await updateYear({
                    year_id: selectedYear.id,
                    ...yearData,
                }).unwrap();
                showToast("success", "Success", "Year updated successfully");
            } else {
                await createYear(yearData).unwrap();
                showToast("success", "Success", "Year created successfully");
            }
            handleCloseForm();
            fetchYears();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleDeleteClick = (year: YearResponseDto) => {
        setSelectedYear(year);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedYear?.id) return;

        try {
            await deleteYear({ year_id: selectedYear.id }).unwrap();
            showToast("success", "Success", "Year deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedYear(null);
            fetchYears();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const uniqueYears = Array.from(
        new Set(years.map((y) => y.year?.toString() || "")),
    ).filter(Boolean);

    const yearOptions = [
        { value: "", label: "Academic Year" },
        ...uniqueYears.map((year) => ({ value: String(year), label: String(year) })),
    ];

    return (
        <>
            <PageSeo
                title="Academic Years Management - CU Portal"
                description="Manage and organize your academic years efficiently"
            />
            <Layout>
                <div className={styles["page"]}>
                    <Banner
                        title="Academic years Management"
                        description="Manage And Organize Your Academic Years Efficiently"
                        button="Add Years"
                        buttonAction={() => handleOpenForm()}
                    />

                    <div className={styles["container"]}>
                        <div className={styles["filter-section"]}>
                            <SelectFilter
                                setValue={setYearFilter}
                                value={yearFilter}
                                options={yearOptions}
                            />
                        </div>

                        <div className={styles["cards-grid"]}>
                            {filteredYears.length > 0 ? (
                                filteredYears.map((year) => (
                                    <Card
                                        key={year.id}
                                        title={year.year?.toString()}
                                        editable
                                        deletable
                                        hasOptions
                                        onEdit={() => handleOpenForm(year)}
                                        onDelete={() => handleDeleteClick(year)}
                                    />
                                ))
                            ) : (
                                <div className={styles["no-data"]}>
                                    No years found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <FloatingForm
                    isOpen={isFormOpen}
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    title={editMode ? "Edit Year" : "Add A New Year"}
                    onClose={isCreating || isUpdating ? undefined : handleCloseForm}
                    disabled={isCreating || isUpdating}
                >
                    <Input
                        register={register}
                        name="year"
                        type="text"
                        placeholder="Year..."
                        errors={errors}
                    />
                    <Button
                        type="submit"
                        text={editMode ? "Edit year" : "Add year"}
                        loadingText={editMode ? "Updating..." : "Adding..."}
                        isSubmitting={isCreating || isUpdating}
                        isOrange={false}
                    />
                </FloatingForm>

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    confirmText={isDeleting ? "Deleting..." : "Delete"}
                    title="Delete Year?"
                    message={`Are you sure you want to delete "${selectedYear?.year}"? This action cannot be undone.`}
                    colorType="red"
                />
            </Layout>
        </>
    );
};
