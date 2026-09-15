import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import {
    useLazyGetMaterialsQuery,
    useLazyGetMaterialParentsQuery,
} from "../../../services/apis/user/MaterialAPIs";
import type { MaterialResponseDto } from "../../../types/dtos/MaterialDtos";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { downloadFile, downloadMaterials } from "../../../utils/FileDownloader";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Search } from "../../../components/forms/Search";
import { EmptySection } from "../../../components/materials/EmptySection";
import { MaterialCard } from "../../../components/materials/MaterialCard";
import { Navigator } from "../../../components/materials/Navigator";
import { MaterialSelectionMenu } from "../../../components/materials/MaterialSelectionMenu";
import { Preview } from "../../../components/preview/Preview";

import emptySectionIcon from "../../../assets/icons/materials-welcome.svg";
import folderEmptyIcon from "../../../assets/icons/folder-empty.jpg";
import { Banner } from "../../../components/banner/Banner";

import styles from "./MaterialsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

export function MaterialsPage() {
    const navigate = useNavigate();
    const { getFilter, getFilterSetter, searchParams, setSearchParams } = useFilterSearchParams();
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");

    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [currentPath, setCurrentPath] = useState<MaterialResponseDto[]>([]);
    const [materials, setMaterials] = useState<MaterialResponseDto[]>([]);
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const subjectFilter = getFilter("subject_id");
    const parentFilter = getFilter("parent_id");
    const currentParentId = parentFilter ? Number(parentFilter) : null;

    const [getSubjects] = useLazyGetEnrolledCoursesQuery();
    const [getMaterials] = useLazyGetMaterialsQuery();
    const [getMaterialParents] = useLazyGetMaterialParentsQuery();

    const fetchSubjects = useCallback(async () => {
        try {
            const result = await getSubjects().unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getSubjects]);

    const fetchMaterials = useCallback(
        async (parentId?: number | null) => {
            if (!subjectFilter) return;

            try {
                const response = await getMaterials({
                    data: {
                        subject_id: parseInt(subjectFilter),
                        parent_id: parentId ?? null,
                        query: searchQuery || undefined,
                    },
                    includes: ["subject", "children", "attachment"],
                }).unwrap();
                setMaterials(response.data || []);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [subjectFilter, searchQuery, getMaterials],
    );

    const buildMaterialsPath = useCallback(
        (
            subjectValue?: string | number | null,
            parentValue?: string | number | null,
        ) => {
            const params = new URLSearchParams(searchParams);
            if (subjectValue) params.set("subject_id", String(subjectValue));
            else params.delete("subject_id");
            if (parentValue) params.set("parent_id", String(parentValue));
            else params.delete("parent_id");
            params.delete("material_id");
            const query = params.toString();
            return `/user/materials${query ? `?${query}` : ""}`;
        },
        [searchParams],
    );

    const loadCurrentPath = useCallback(
        async (materialId: number | null) => {
            if (!materialId) {
                setCurrentPath([]);
                return;
            }

            try {
                const response = await getMaterialParents({
                    material_id: materialId,
                }).unwrap();
                setCurrentPath([...(response.data || [])]);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [getMaterialParents],
    );

    const handleNavigate = useCallback(
        (material: MaterialResponseDto | null) => {
            navigate(buildMaterialsPath(subjectFilter, material?.id ?? null));
            setSelectedMaterials([]);
            setIsSelectionMode(false);
        },
        [buildMaterialsPath, navigate, subjectFilter],
    );

    const authFilterQuery = useCallback(
        () => fetchSubjects(),
        [fetchSubjects],
    );

    const authMaterialsQuery = useCallback(
        () => fetchMaterials(currentParentId),
        [fetchMaterials, currentParentId],
    );

    useAuthQuery(authFilterQuery);
    useAuthQuery(authMaterialsQuery);

    useEffect(() => {
        setSelectedMaterials([]);
        setIsSelectionMode(false);

        if (!subjectFilter) {
            setCurrentPath([]);
            setMaterials([]);
            return;
        }

        void loadCurrentPath(currentParentId);
    }, [loadCurrentPath, currentParentId, subjectFilter]);

    const handlePreview = useCallback((fileId: string, fileName: string) => {
        setPreviewFile({ id: fileId, name: fileName });
    }, []);

    const handleClosePreview = () => {
        setPreviewFile(null);
    };

    const handleDownloadFile = useCallback((fileId: string) => {
        if (fileId) downloadFile(fileId);
    }, []);

    const handleDownloadMaterial = useCallback((materialId: number) => {
        downloadMaterials([materialId]);
    }, []);

    const handleDownloadSelected = useCallback(() => {
        if (selectedMaterials.length === 0) return;
        if (selectedMaterials.length === 1) {
            handleDownloadMaterial(selectedMaterials[0]);
            return;
        }
        downloadMaterials(selectedMaterials);
    }, [selectedMaterials, handleDownloadMaterial]);

    const handleCardClick = useCallback(
        (material: MaterialResponseDto) => {
            if (!material.id) return;
            if (isSelectionMode) {
                setSelectedMaterials((prev) =>
                    prev.includes(material.id!)
                        ? prev.filter((id) => id !== material.id)
                        : [...prev, material.id!],
                );
            } else {
                setIsSelectionMode(true);
                setSelectedMaterials([material.id]);
            }
        },
        [isSelectionMode],
    );

    const handleCardDoubleClick = useCallback(
        (material: MaterialResponseDto) => {
            if (material.material_type === "folder") handleNavigate(material);
        },
        [handleNavigate],
    );

    const handleSelectAll = useCallback(() => {
        const ids = materials
            .map((item) => item.id)
            .filter((id): id is number => id !== undefined);
        setSelectedMaterials((prev) => (prev.length === ids.length ? [] : ids));
    }, [materials]);

    const handleCancelSelection = useCallback(() => {
        setSelectedMaterials([]);
        setIsSelectionMode(false);
    }, []);

    const handleOpenLink = (url: string) => {
        window.open(url, "_blank");
    };

    const handleShareMaterials = (
        materialId?: number,
        type?: string | null,
    ) => {
        const parentId =
            currentPath.length > 0
                ? currentPath[currentPath.length - 1].id
                : null;
        let url = `${window.location.origin}${buildMaterialsPath(subjectFilter, parentId)}`;
        if (type === "folder") {
            url = `${window.location.origin}${buildMaterialsPath(subjectFilter, materialId)}`;
        } else if (type === "file") {
            const previewUrl = new URL(url, window.location.origin);
            previewUrl.searchParams.set("material_id", String(materialId ?? ""));
            url = previewUrl.toString();
        } else {
            url =
                materials.find((m) => m.id === materialId)?.attachment?.url ||
                "";
        }
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "Material link copied to clipboard successfully",
        );
    };

    useEffect(() => {
        const material_id = searchParams.get("material_id");
        if (material_id && materials.length > 0) {
            const material = materials.find(
                (m) => m.id === parseInt(material_id),
            );
            if (material) {
                handlePreview(
                    material.attachment?.details?.file_data?.id || "",
                    material.name || "Preview",
                );
                const nextParams = new URLSearchParams(searchParams);
                nextParams.delete("material_id");
                setSearchParams(nextParams, { replace: true });
            }
        }
    }, [searchParams, materials, handlePreview, setSearchParams]);

    const folders = useMemo(
        () => materials.filter((m) => m.material_type === "folder"),
        [materials],
    );
    const files = useMemo(
        () => materials.filter((m) => m.material_type !== "folder"),
        [materials],
    );

    const subjectOptions = useMemo(
        () => [
            { value: "", label: "All Courses" },
            ...subjects.map((subject) => ({
                value: subject.id?.toString() || "",
                label: subject.name || "",
            })),
        ],
        [subjects],
    );

    const showFilterPage = !subjectFilter;
    const showEmptyPage = subjectFilter && materials.length === 0;
    const showContentPage = subjectFilter && materials.length > 0;

    return (
        <Layout>
            <PageSeo
                title="Materials - CU Portal"
                description="Browse and access your course materials"
            />
            <Banner
                title="My Materials"
                description="Browse and access your course materials"
            />
            <div className={styles.container}>
                <div className={styles.filtersSection}>
                    <SelectFilter
                        options={subjectOptions}
                        setValue={(value) => {
                            navigate(buildMaterialsPath(String(value), null));
                        }}
                        value={subjectFilter}
                    />
                </div>

                {!showFilterPage && (
                    <div className={styles.searchActionsSection}>
                        <div className={styles.searchContainer}>
                            <Search
                                placeholder="Search Materials..."
                                setValue={setSearchQuery} value={searchQuery}
                            />
                        </div>
                    </div>
                )}

                {showContentPage && (
                    <>
                        <Navigator
                            path={currentPath}
                            onNavigate={handleNavigate}
                        />

                        <div className={styles.contentSection}>
                            <div className={styles.contentGrid}>
                                {folders.map((folder) => {
                                    if (!folder.id) return null;
                                    const folderId = folder.id;
                                    return (
                                        <MaterialCard
                                            key={folderId}
                                            material={folder}
                                            showCount={true}
                                            isSelected={selectedMaterials.includes(
                                                folderId,
                                            )}
                                            isSelectionMode={isSelectionMode}
                                            onClick={() =>
                                                handleCardClick(folder)
                                            }
                                            onDoubleClick={() =>
                                                handleCardDoubleClick(folder)
                                            }
                                            onDragStart={() => {}}
                                            onShare={() => {
                                                handleShareMaterials(
                                                    folderId,
                                                    folder.material_type,
                                                );
                                            }}
                                            onPreview={handlePreview}
                                            onDownload={handleDownloadFile}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={false}
                                            className={styles.materialCard}
                                        />
                                    );
                                })}
                                {files.map((file) => {
                                    if (!file.id) return null;
                                    const fileId = file.id;
                                    return (
                                        <MaterialCard
                                            key={fileId}
                                            material={file}
                                            showCount={false}
                                            isSelected={selectedMaterials.includes(
                                                fileId,
                                            )}
                                            isSelectionMode={isSelectionMode}
                                            onClick={() =>
                                                handleCardClick(file)
                                            }
                                            onDoubleClick={() =>
                                                handleCardDoubleClick(file)
                                            }
                                            onDragStart={() => {}}
                                            onShare={() => {
                                                handleShareMaterials(
                                                    fileId,
                                                    file.material_type,
                                                );
                                            }}
                                            onPreview={handlePreview}
                                            onDownload={handleDownloadFile}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={false}
                                            className={styles.materialCard}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {showEmptyPage && (
                    <>
                        <Navigator
                            path={currentPath}
                            onNavigate={handleNavigate}
                        />
                        <EmptySection
                            text="No Files Available"
                            subtitle="There are currently no files in this folder."
                            img={folderEmptyIcon}
                        />
                    </>
                )}

                {showFilterPage && (
                    <div className={styles.filterPage}>
                        <img
                            src={emptySectionIcon}
                            alt="Materials Explorer"
                            className={styles.filterPageImage}
                        />
                        <div className={styles.filterPageTitle}>
                            Welcome to Materials Explorer
                        </div>
                        <div className={styles.filterPageSubtitle}>
                            Browse and search through your course materials.
                            Select a course above to get started.
                        </div>
                    </div>
                )}

                {showContentPage && (
                    <MaterialSelectionMenu
                        isSelectionMode={isSelectionMode}
                        selectedCount={selectedMaterials.length}
                        totalCount={materials.length}
                        onEnter={() => setIsSelectionMode(true)}
                        onCancel={handleCancelSelection}
                        onSelectAll={handleSelectAll}
                        onDownload={handleDownloadSelected}
                    />
                )}

                {previewFile && (
                    <Preview
                        file_id={previewFile.id}
                        fileName={previewFile.name}
                        onClose={handleClosePreview}
                        onDownload={() => downloadFile(previewFile.id)}
                    />
                )}
            </div>
        </Layout>
    );
}
