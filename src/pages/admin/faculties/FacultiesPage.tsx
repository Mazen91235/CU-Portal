import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetFacultiesQuery,
    useCreateFacultyMutation,
    useUpdateFacultyMutation,
    useDeleteFacultyMutation,
} from "../../../services/apis/admin/FacultyAPIs";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import { showToast } from "../../../utils/ToastsManager";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { Card } from "../../../components/card/Card";
import { FloatingForm } from "../../../components/forms/FloatingForm";
import { Input } from "../../../components/forms/Input";
import { Button } from "../../../components/forms/Button";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { Layout } from "../../../components/layout/Layout";
import styles from "./FacultiesPage.module.css";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";

const facultySchema = z.object({
    name: z.string().min(1, "Faculty name is required"),
});

type FacultyFormData = z.infer<typeof facultySchema>;

export const FacultiesPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFaculty, setSelectedFaculty] =
        useState<FacultyResponseDto | null>(null);
    const [editMode, setEditMode] = useState(false);

    const [getFaculties] = useLazyGetFacultiesQuery();
    const [createFaculty, { isLoading: isCreating }] =
        useCreateFacultyMutation();
    const [updateFaculty, { isLoading: isUpdating }] =
        useUpdateFacultyMutation();
    const [deleteFaculty, { isLoading: isDeleting }] =
        useDeleteFacultyMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FacultyFormData>({
        resolver: zodResolver(facultySchema),
    });

    const fetchFaculties = useCallback(async () => {
        try {
            const result = await getFaculties({ limit: 1e6 }).unwrap();
            setFaculties(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getFaculties]);

    useAuthQuery(fetchFaculties);

    const filteredFaculties = useMemo(
        () =>
            faculties.filter((faculty) =>
                faculty.name?.toLowerCase().includes(searchQuery.toLowerCase()),
            ),
        [faculties, searchQuery],
    );

    const handleOpenForm = (faculty?: FacultyResponseDto) => {
        if (faculty) {
            setEditMode(true);
            setSelectedFaculty(faculty);
            reset({ name: faculty.name || "" });
        } else {
            setEditMode(false);
            setSelectedFaculty(null);
            reset({ name: "" });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditMode(false);
        setSelectedFaculty(null);
        reset({ name: "" });
    };

    const onSubmit = async (data: FacultyFormData) => {
        try {
            if (editMode && selectedFaculty?.id) {
                await updateFaculty({
                    faculty_id: selectedFaculty.id,
                    name: data.name,
                }).unwrap();
                showToast("success", "Success", "Faculty updated successfully");
            } else {
                await createFaculty({ name: data.name }).unwrap();
                showToast("success", "Success", "Faculty created successfully");
            }
            handleCloseForm();
            fetchFaculties();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleDeleteClick = (faculty: FacultyResponseDto) => {
        setSelectedFaculty(faculty);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedFaculty?.id) return;

        try {
            await deleteFaculty({ faculty_id: selectedFaculty.id }).unwrap();
            showToast("success", "Success", "Faculty deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedFaculty(null);
            fetchFaculties();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    return (
        <>
            <PageSeo
                title="Faculties Management - CU Portal"
                description="Manage and organize your faculties efficiently"
            />
            <Layout>
                <div className={styles["page"]}>
                    <Banner
                        title="Faculties Management"
                        description="Manage And Organize Your Faculties Efficiently"
                        button="Add Faculties"
                        buttonAction={() => handleOpenForm()}
                    />

                    <div className={styles["container"]}>
                        <div className={styles["search-section"]}>
                            <Search
                                placeholder="Search faculties"
                                setValue={setSearchQuery}
                            />
                        </div>

                        <div className={styles["cards-grid"]}>
                            {filteredFaculties.length > 0 ? (
                                filteredFaculties.map((faculty) => (
                                    <Card
                                        key={faculty.id}
                                        title={faculty.name ?? "Untitled Faculty"}
                                        editable
                                        deletable
                                        hasOptions
                                        onEdit={() => handleOpenForm(faculty)}
                                        onDelete={() =>
                                            handleDeleteClick(faculty)
                                        }
                                    />
                                ))
                            ) : (
                                <div className={styles["no-data"]}>
                                    No faculties found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <FloatingForm
                    isOpen={isFormOpen}
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    title={editMode ? "Edit Faculty" : "Add A New Faculty"}
                    onClose={isCreating || isUpdating ? undefined : handleCloseForm}
                    disabled={isCreating || isUpdating}
                >
                    <Input
                        register={register}
                        name="name"
                        type="text"
                        placeholder="Faculty name..."
                        errors={errors}
                    />
                    <Button
                        type="submit"
                        text={editMode ? "Edit faculty" : "Add faculty"}
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
                    title="Delete Faculty?"
                    message={`Are you sure you want to delete "${selectedFaculty?.name}"? This action cannot be undone.`}
                    colorType="red"
                />
            </Layout>
        </>
    );
};
