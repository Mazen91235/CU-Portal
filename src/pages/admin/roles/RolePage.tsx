import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import {
    useLazyGetRoleQuery,
    useLazyGetPermissionsQuery,
    useUpdateRoleMutation,
} from "../../../services/apis/admin/RoleAPIs";
import type { RoleResponseDto } from "../../../types/dtos/RoleDtos";
import { showToast } from "../../../utils/ToastsManager";
import { getErrorMessage, handlePopupErrors } from "../../../utils/ErrorHandling";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { Avatar } from "../../../components/avatar/Avatar";
import { Table } from "../../../components/table/Table";
import styles from "./RolePage.module.css";
import { SubBanner } from "../../../components/banner/SubBanner";

export const RolePage = () => {
    const { roleId } = useParams<{ roleId: string }>();
    const [role, setRole] = useState<RoleResponseDto | null>(null);
    const [allPermissions, setAllPermissions] = useState<string[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        [],
    );
    const [isEditing, setIsEditing] = useState(false);
    const [hasNoPermissions, setHasNoPermissions] = useState(false);

    const [getRole] = useLazyGetRoleQuery();
    const [getPermissions] = useLazyGetPermissionsQuery();
    const [updateRole, { isLoading: isUpdatingRole }] = useUpdateRoleMutation();
    const navigate = useNavigate();

    const fetchRole = useCallback(async () => {
        if (!roleId) return;
        try {
            const result = await getRole({ role_id: Number(roleId) }).unwrap();
            const roleResponse = result.data;
            if (!roleResponse) {
                navigate("/admin/roles", {
                    state: { error: "Failed to fetch role" },
                });
                return;
            }
            setRole(roleResponse);
            setSelectedPermissions(
                roleResponse?.exact_roles?.map((r) => r.name ?? "") || [],
            );
            setHasNoPermissions((roleResponse?.exact_roles?.length || 0) === 0);
            if (roleResponse?.exact_roles?.length === 0) {
                setIsEditing(true);
            }
        } catch (error) {
            navigate("/admin/roles", {
                state: { error: getErrorMessage(error) || "Failed to fetch role" },
            });
        }
    }, [roleId, getRole, navigate]);

    const fetchAllPermissions = useCallback(async () => {
        try {
            const result = await getPermissions().unwrap();
            setAllPermissions(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getPermissions]);

    const authQueryParams = useCallback(
        () => Promise.all([fetchRole(), fetchAllPermissions()]),
        [fetchRole, fetchAllPermissions],
    );

    useAuthQuery(authQueryParams);

    const handleTogglePermission = (permission: string) => {
        if (!isEditing) return;

        setSelectedPermissions((prev) => {
            if (prev.includes(permission)) {
                return prev.filter((p) => p !== permission);
            } else {
                return [...prev, permission];
            }
        });
    };

    const handleSave = async () => {
        if (!role || !roleId) return;

        try {
            await updateRole({
                role_id: Number(roleId),
                name: role.name || "",
                permissions: selectedPermissions,
            }).unwrap();
            showToast("success", "Success", "Role updated successfully");
            setIsEditing(false);
            await fetchRole();
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    if (!role) return null;

    return (
        <Layout>
            <PageSeo
                title={`${role.name || "Role"} - CU Portal`}
                description="Define and manage user roles to ensure secure and organized access across the platform"
            />

            <SubBanner
                title={role.name || "Role Details"}
                description={`Manage permissions and users for the ${role.name} role`}
                icon="user"
                linkText="Back to Roles"
                linkTo="/admin/roles"
            />

            {hasNoPermissions ? (
                <>
                    <div className={styles.permissionsHeader}>
                        <div className={styles.roleNameSection}>
                            <h2 className={styles.roleName}>
                                {role.name}
                                <span className={styles.roleNameWarning}>
                                    (This role has been created but doesn&apos;t
                                    have any permissions)
                                </span>
                            </h2>
                            <p className={styles.roleDescription}>
                                To Activate This Role, Choose The Permissions
                                You Want To Allow From The List Below
                            </p>
                        </div>
                    </div>

                    <div className={styles.initPermHeader}>
                        <p className={styles.initPermTitle}>Permissions</p>
                        <div className={styles.actionButtons}>
                            <button
                                className={styles.saveButton}
                                onClick={handleSave}
                                disabled={isUpdatingRole}
                            >
                                {isUpdatingRole ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>

                    <fieldset
                        className={styles.permissionsFieldset}
                        disabled={isUpdatingRole}
                    >
                        <div className={styles.permissionsList}>
                            {allPermissions.map((permission) => (
                                <div
                                key={permission}
                                className={styles.permissionRow}
                            >
                                <span className={styles.permissionLabel}>
                                    {permission}
                                </span>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(
                                            permission,
                                        )}
                                        onChange={() =>
                                            handleTogglePermission(permission)
                                        }
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                                </div>
                            ))}
                        </div>
                    </fieldset>
                </>
            ) : (
                <>
                    <div className={styles.permissionsHeader}>
                        <div className={styles.roleNameSection}>
                            <h2 className={styles.roleName}>{role.name}</h2>
                            <h2 className={styles.permissionsTitle}>
                                Permissions
                            </h2>
                        </div>
                        <div className={styles.actionButtons}>
                            {isEditing ? (
                                <button
                                    className={styles.saveButton}
                                    onClick={handleSave}
                                    disabled={isUpdatingRole}
                                >
                                    {isUpdatingRole ? "Saving..." : "Save Changes"}
                                </button>
                            ) : (
                                <button
                                    className={styles.editButton}
                                    onClick={handleEdit}
                                >
                                    Edit Permissions
                                </button>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <fieldset
                            className={styles.permissionsFieldset}
                            disabled={isUpdatingRole}
                        >
                            <div className={styles.permissionsList}>
                                {allPermissions.map((permission) => (
                                    <div
                                        key={permission}
                                        className={styles.permissionRow}
                                    >
                                        <span className={styles.permissionLabel}>
                                            {permission}
                                        </span>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(
                                                    permission,
                                                )}
                                                onChange={() =>
                                                    handleTogglePermission(
                                                        permission,
                                                    )
                                                }
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    ) : (
                        <div className={styles.permissionsGrid}>
                            {selectedPermissions.map((permission) => (
                                <div
                                    key={permission}
                                    className={styles.permissionCard}
                                >
                                    {permission}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.roleUsers}>
                        <div className={styles.roleUsersTitle}>
                            Users With This Role
                            <span className={styles.avatarGroup}>
                                {role.users?.slice(0, 5).map((user, index) => (
                                    <Avatar
                                        key={index}
                                        user={user}
                                        size="small"
                                    />
                                ))}
                            </span>
                        </div>
                        <div className={styles.roleUsersSubtitle}>
                            There Are Currently{" "}
                            <strong className={styles.userCount}>
                                {role.users?.length || 0}
                            </strong>{" "}
                            Users Assigned To This Role
                        </div>
                    </div>

                    <Table
                        columns={["User Name", "Email", "Phone"]}
                        data={
                            role.users && role.users.length > 0
                                ? role.users.map((user) => ({
                                      data: [
                                          user.name || "N/A",
                                          user.email || "N/A",
                                          user.phone || "N/A",
                                      ],
                                      onClick: () =>
                                          navigate(`/admin/users/${user.id}`),
                                  }))
                                : []
                        }
                        action={true}
                    />
                </>
            )}
        </Layout>
    );
};
