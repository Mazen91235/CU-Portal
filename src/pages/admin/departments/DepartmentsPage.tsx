import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    useLazyGetDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { DepartmentStudyType } from "../../../types/entities/Department";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import { showToast } from "../../../utils/ToastsManager";
import { PageSeo } from "../../../components/PageSeo";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";
import { Select } from "../../../components/forms/Select";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Card } from "../../../components/card/Card";
import { FloatingForm } from "../../../components/forms/FloatingForm";
import { Input } from "../../../components/forms/Input";
import { Button } from "../../../components/forms/Button";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import styles from "./DepartmentsPage.module.css";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { Layout } from "../../../components/layout/Layout";

const departmentSchema = z.object({
    name: z.string().min(1, "Department name is required"),
    code: z.string().min(1, "Department code is required"),
    study_type: z.string().min(1, "Study type is required"),
    faculty_id: z.string().min(1, "Faculty is required"),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

export const DepartmentsPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [studyTypeFilter, setStudyTypeFilter] = useState<string>("");
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] =
        useState<DepartmentResponseDto | null>(null);
    const [editMode, setEditMode] = useState(false);

    const [getDepartments] = useLazyGetDepartmentsQuery();
    const [searchFaculties] = useLazyGetFacultiesQuery();
    const [createDepartment, { isLoading: isCreating }] =
        useCreateDepartmentMutation();
    const [updateDepartment, { isLoading: isUpdating }] =
        useUpdateDepartmentMutation();
    const [deleteDepartment, { isLoading: isDeleting }] =
        useDeleteDepartmentMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<DepartmentFormData>({
        resolver: zodResolver(departmentSchema),
    });

    const fetchFaculties = useCallback(async () => {
        try {
            const result = await searchFaculties({ data: {} }).unwrap();
            setFaculties(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchFaculties]);

    const fetchDepartments = useCallback(async () => {
        try {
            const result = await getDepartments({
                data: {
                    faculty_id: parseInt(facultyFilter) || undefined,
                    study_type:
                        (studyTypeFilter as DepartmentStudyType) || undefined,
                },
                includes: ["faculty"],
                limit: Infinity,
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartments, facultyFilter, studyTypeFilter]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchFaculties(), fetchDepartments()]),
        [fetchFaculties, fetchDepartments],
    );

    useAuthQuery(authQueryParams);

    const filteredDepartments = useMemo(
        () =>
            departments.filter((dept) => {
                const matchesSearch =
                    dept.name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    dept.code
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase());
                return matchesSearch;
            }),
        [departments, searchQuery],
    );
    const handleOpenForm = (department?: DepartmentResponseDto) => {
        if (department) {
            setEditMode(true);
            setSelectedDepartment(department);
            reset({
                name: department.name || "",
                code: department.code || "",
                study_type: department.study_type || "",
                faculty_id: department.faculty?.id?.toString() || "",
            });
        } else {
            setEditMode(false);
            setSelectedDepartment(null);
            reset({
                name: "",
                code: "",
                study_type: studyTypeFilter ?? "",
                faculty_id: facultyFilter,
            });
        }
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditMode(false);
        setSelectedDepartment(null);
        reset({ name: "", code: "", study_type: "", faculty_id: "" });
    };

    const onSubmit = async (data: DepartmentFormData) => {
        try {
            const departmentData = {
                name: data.name,
                code: data.code,
                study_type: data.study_type as DepartmentStudyType,
                faculty_id: parseInt(data.faculty_id),
            };

            if (editMode && selectedDepartment?.id) {
                await updateDepartment({
                    department_id: selectedDepartment.id,
                    ...departmentData,
                }).unwrap();
                showToast(
                    "success",
                    "Success",
                    "Department updated successfully",
                );
            } else {
                await createDepartment(departmentData).unwrap();
                showToast(
                    "success",
                    "Success",
                    "Department created successfully",
                );
            }
            handleCloseForm();
            fetchDepartments();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleDeleteClick = (department: DepartmentResponseDto) => {
        setSelectedDepartment(department);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedDepartment?.id) return;

        try {
            await deleteDepartment({
                department_id: selectedDepartment.id,
            }).unwrap();
            showToast("success", "Success", "Department deleted successfully");
            setIsDeleteModalOpen(false);
            setSelectedDepartment(null);
            fetchDepartments();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const facultyOptions = useMemo(
        () => [
            { value: "", label: "Faculty" },
            ...faculties.map((faculty) => ({
                value: faculty.id?.toString() || "",
                label: faculty.name || "",
            })),
        ],
        [faculties],
    );

    const studyTypeOptions = [
        { value: "", label: "Study Type" },
        { value: "Mainstream", label: "Mainstream" },
        { value: "Credit", label: "Credit" },
    ];

    const facultyFormOptions = useMemo(
        () =>
            faculties.map((faculty) => ({
                value: faculty.id?.toString() || "",
                label: faculty.name || "",
            })),
        [faculties],
    );

    const studyTypeFormOptions = [
        { value: "Mainstream", label: "Mainstream" },
        { value: "Credit", label: "Credit" },
    ];

    return (
        <>
            <PageSeo
                title="Departments Management - CU Portal"
                description="Manage and organize your departments efficiently"
            />
            <Layout>
                <div className={styles["page"]}>
                    <Banner
                        title="Departments Management"
                        description="Manage and organize your departments efficiently"
                        button="Add Department"
                        buttonAction={() => handleOpenForm()}
                    />

                    <div className={styles["container"]}>
                        <div className={styles["filters-section"]}>
                            <div className={styles["search-wrapper"]}>
                                <Search
                                    placeholder="Search departments..."
                                    setValue={setSearchQuery}
                                />
                            </div>
                            <div className={styles["filters-wrapper"]}>
                                <SelectFilter
                                    setValue={setFacultyFilter}
                                    options={facultyOptions}
                                />
                                <SelectFilter
                                    setValue={setStudyTypeFilter}
                                    options={studyTypeOptions}
                                />
                            </div>
                        </div>

                        <div className={styles["cards-grid"]}>
                            {filteredDepartments.length > 0 ? (
                                filteredDepartments.map((dept) => (
                                    <Card
                                        key={dept.id}
                                        badge={dept.code ?? "N/A"}
                                        title={dept.name}
                                        items={[
                                            {
                                                icon: "subject",
                                                label: "Faculty",
                                                value:
                                                    dept.faculty?.name || "N/A",
                                            },
                                            {
                                                icon: "subject",
                                                label: "Study Type",
                                                value: dept.study_type || "N/A",
                                            },
                                        ]}
                                        editable
                                        deletable
                                        hasOptions
                                        onEdit={() => handleOpenForm(dept)}
                                        onDelete={() => handleDeleteClick(dept)}
                                    />
                                ))
                            ) : (
                                <div className={styles["no-data"]}>
                                    No departments found
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <FloatingForm
                    isOpen={isFormOpen}
                    onSubmit={handleSubmit(onSubmit)}
                    errors={errors}
                    title={
                        editMode
                            ? "Edit Department"
                            : "Let's Add a New Department"
                    }
                    onClose={handleCloseForm}
                >
                    <Input
                        register={register}
                        name="name"
                        type="text"
                        placeholder="Name.."
                        errors={errors}
                        label="Department Name"
                    />
                    <Input
                        register={register}
                        name="code"
                        type="text"
                        placeholder="Code.."
                        errors={errors}
                        label="Department Code"
                    />
                    <Select
                        register={register}
                        name="study_type"
                        errors={errors}
                        label="Study Type"
                    >
                        <option value="">Select Study Type</option>
                        {studyTypeFormOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                    <Select
                        register={register}
                        name="faculty_id"
                        errors={errors}
                        label="Faculty"
                    >
                        <option value="">Select Faculty</option>
                        {facultyFormOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                    <Button
                        type="submit"
                        text={
                            editMode ? "Update Department" : "Save Department"
                        }
                        loadingText={editMode ? "Updating..." : "Saving..."}
                        isSubmitting={isCreating || isUpdating}
                        isOrange={false}
                    />
                </FloatingForm>

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    confirmText={isDeleting ? "Deleting..." : "Delete"}
                    title="Delete Department?"
                    message={`Are you sure you want to delete "${selectedDepartment?.name}"? This action cannot be undone.`}
                    colorType="red"
                />
            </Layout>
        </>
    );
};
