import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { Card } from "../../../components/card/Card";
import {
    useLazyGetRolesQuery,
    useLazyCountPermissionsQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
} from "../../../services/apis/admin/RoleAPIs";
import type { RoleResponseDto } from "../../../types/dtos/RoleDtos";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import styles from "./RolesPage.module.css";
import { Banner } from "../../../components/banner/Banner";
import { Search } from "../../../components/forms/Search";

export const RolesPage = () => {
    const navigate = useNavigate();
    const { getFilter, getFilterSetter } = useFilterSearchParams();
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");
    const [roles, setRoles] = useState<RoleResponseDto[]>([]);
    const [permissionsCount, setPermissionsCount] = useState<number>(0);
    const [filteredRoles, setFilteredRoles] = useState<RoleResponseDto[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("add");
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [roleName, setRoleName] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

    const [getRoles] = useLazyGetRolesQuery();
    const [getPermissionsCount] = useLazyCountPermissionsQuery();
    const [createRole] = useCreateRoleMutation();
    const [updateRole] = useUpdateRoleMutation();
    const [deleteRole] = useDeleteRoleMutation();

    const fetchRoles = useCallback(async () => {
        try {
            const result = await getRoles({
                data: { query: searchQuery },
                includes: ["role_links.exact_role"],
            }).unwrap();
            setRoles(result.data || []);
            setFilteredRoles(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getRoles, searchQuery]);

    const fetchPermissionsCount = useCallback(async () => {
        try {
            const result = await getPermissionsCount().unwrap();
            setPermissionsCount(result.data || 0);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getPermissionsCount]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchRoles(), fetchPermissionsCount()]),
        [fetchRoles, fetchPermissionsCount],
    );

    useAuthQuery(authQueryParams);

    const openModal = (mode: "add" | "edit", roleId?: number) => {
        setModalMode(mode);
        if (mode === "edit" && roleId) {
            const role = roles.find((r) => r.id === roleId);
            if (role) {
                setSelectedRoleId(roleId);
                setRoleName(role.name || "");
            }
        } else {
            setSelectedRoleId(null);
            setRoleName("");
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setRoleName("");
        setSelectedRoleId(null);
    };

    const handleSaveRole = async () => {
        if (!roleName.trim()) {
            showToast("error", "Error", "Role name is required");
            return;
        }

        try {
            if (modalMode === "edit" && selectedRoleId) {
                const role = roles.find((r) => r.id === selectedRoleId);
                if (role && role.name !== roleName.trim()) {
                    await updateRole({
                        role_id: selectedRoleId,
                        name: roleName.trim(),
                    }).unwrap();
                    showToast(
                        "success",
                        "Success",
                        "Role updated successfully",
                    );
                }
            } else {
                await createRole({ name: roleName.trim() }).unwrap();
                showToast("success", "Success", "Role added successfully");
            }
            closeModal();
            await fetchRoles();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleDeleteRole = (roleId: number) => {
        setRoleToDelete(roleId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (roleToDelete) {
            try {
                await deleteRole({ role_id: roleToDelete }).unwrap();
                showToast("success", "Deleted", "Role deleted successfully");
                setDeleteModalOpen(false);
                setRoleToDelete(null);
                await fetchRoles();
            } catch (error) {
                handlePopupErrors(error);
            }
        }
    };

    return (
        <Layout>
            <PageSeo
                title="Roles & Permissions - CU Portal"
                description="Define and manage user roles to ensure secure and organized access across the platform"
            />

            <Banner
                title="Roles & Permissions"
                description="Define and manage user roles to ensure secure and organized access across the platform"
                button="Add New Role"
                buttonAction={() => openModal("add")}
            />

            <div className={styles.searchSection}>
                <Search
                    placeholder="Search roles..."
                    setValue={setSearchQuery} value={searchQuery}
                />
            </div>

            <div className={styles.rolesContainer}>
                {filteredRoles.map((role) => (
                    <Card
                        key={role.id}
                        title={role.name ?? "Untitled Role"}
                        items={[
                            {
                                icon: "users-assigned",
                                label: "Assigned Users",
                                value: String(role.users?.length || 0),
                            },
                            {
                                icon: "permissions",
                                label: "Permissions",
                                value: `${role.exact_roles?.length || 0}/${permissionsCount}`,
                            },
                        ]}
                        button="View Role"
                        buttonAction={() => navigate(`/admin/roles/${role.id}`)}
                        hasOptions={true}
                        editable={true}
                        deletable={true}
                        onEdit={() => openModal("edit", role.id ?? 0)}
                        onDelete={() => handleDeleteRole(role.id!)}
                    />
                ))}

                <div
                    className={styles.addRoleCard}
                    onClick={() => openModal("add")}
                >
                    <div className={styles.addRoleBox}>
                        <span className={styles.addRolePlus}>+</span>
                        <span className={styles.addRoleLabel}>Add Role</span>
                    </div>
                </div>
            </div>

            <div
                className={`${styles.modalOverlay} ${isModalOpen ? styles.show : ""}`}
                onClick={closeModal}
            >
                <div
                    className={styles.modalCard}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className={styles.modalTitle}>
                        {modalMode === "add" ? "Add New Role" : "Edit Role"}
                    </h2>
                    <p className={styles.modalSubtitle}>
                        Create A Custom Role And Assign Permissions That Fit
                        Your Needs
                    </p>

                    <input
                        type="text"
                        className={styles.roleInput}
                        placeholder="Role Name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                    />

                    <div className={styles.modalActions}>
                        <button
                            className={styles.btnSave}
                            onClick={handleSaveRole}
                        >
                            Save Role
                        </button>
                        <button
                            className={styles.btnCancel}
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModalOpen}
                title="Delete Role"
                message="Are you sure you want to delete this role?"
                confirmText="Delete"
                colorType="red"
                onConfirm={confirmDelete}
                onClose={() => setDeleteModalOpen(false)}
            />
        </Layout>
    );
};
