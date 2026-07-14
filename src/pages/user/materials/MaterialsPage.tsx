import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import {
    useLazyGetMaterialsQuery,
    useLazyGetMaterialParentsQuery,
} from "../../../services/apis/user/MaterialAPIs";
import type { Material } from "../../../types/entities/Material";
import type { Subject } from "../../../types/entities/Subject";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { downloadFile } from "../../../utils/FileDownloader";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Search } from "../../../components/forms/Search";
import { EmptySection } from "../../../components/materials/EmptySection";
import { MaterialCard } from "../../../components/materials/MaterialCard";
import { Navigator } from "../../../components/materials/Navigator";
import { Preview } from "../../../components/preview/Preview";

import emptySectionIcon from "../../../assets/icons/materials-welcome.svg";
import folderEmptyIcon from "../../../assets/icons/folder-empty.jpg";
import { Banner } from "../../../components/banner/Banner";

import styles from "./MaterialsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

export function MaterialsPage() {
    const navigate = useNavigate();
    const { subjectId: routeSubjectId, parentId: routeParentId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [currentPath, setCurrentPath] = useState<Material[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [fileToDownload, setFileToDownload] = useState<{
        url: string;
        name: string;
    } | null>(null);
    const [shouldDownload, setShouldDownload] = useState(false);
    const downloadLink = useRef<HTMLAnchorElement>(null);
    const subjectFilter = routeSubjectId ?? "";
    const currentParentId = routeParentId ? Number(routeParentId) : null;

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
                    subject_id: parseInt(subjectFilter),
                    parent_id: parentId ?? undefined,
                    query: searchQuery || undefined,
                }).unwrap();
                setMaterials(response.data || []);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [subjectFilter, searchQuery, getMaterials],
    );

    const buildMaterialsPath = useCallback(
        (subjectValue?: string | number | null, parentValue?: string | number | null) => {
            if (!subjectValue) return "/user/materials";
            const subjectSegment = String(subjectValue);
            if (!parentValue) {
                return `/user/materials/${subjectSegment}`;
            }
            return `/user/materials/${subjectSegment}/${parentValue}`;
        },
        [],
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
        (material: Material | null) => {
            navigate(
                buildMaterialsPath(subjectFilter, material?.id ?? null),
            );
        },
        [buildMaterialsPath, navigate, subjectFilter],
    );

    const authQueryParams = useCallback(
        async () => Promise.all([fetchSubjects()]),
        [fetchSubjects],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        if (!subjectFilter) {
            setCurrentPath([]);
            setMaterials([]);
            return;
        }

        void loadCurrentPath(currentParentId);
    }, [loadCurrentPath, currentParentId, subjectFilter]);

    useEffect(() => {
        if (!subjectFilter) {
            setMaterials([]);
            return;
        }

        void fetchMaterials(currentParentId);
    }, [fetchMaterials, currentParentId, subjectFilter]);

    const handleCardDoubleClick = (material: Material) => {
        if (material.type === "folder") {
            handleNavigate(material);
        }
    };

    const handlePreview = useCallback((fileId: string, fileName: string) => {
        setPreviewFile({ id: fileId, name: fileName });
    }, []);

    const handleClosePreview = () => {
        setPreviewFile(null);
    };

    const handleDownload = async (fileId: string, fileName: string) => {
        try {
            const url = await downloadFile(fileId);
            setFileToDownload({ url, name: fileName });
            setShouldDownload(true);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

    const handleOpenLink = (url: string) => {
        window.open(url, "_blank");
    };

    const handleShareMaterials = (materialId?: number, type?: string) => {
        const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
        let url = `${window.location.origin}${buildMaterialsPath(subjectFilter, parentId)}`;
        if (type === "folder") {
            url = `${window.location.origin}${buildMaterialsPath(subjectFilter, materialId)}`;
        } else if (type === "file") {
            url += `?material_id=${materialId}`;
        } else {
            url = materials.find((m) => m.id === materialId)?.url || "";
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
            const material = materials.find((m) => m.id === parseInt(material_id));
            if (material) {
                handlePreview(
                    material.details?.file_data?.id || "",
                    material.name || "Preview",
                );
                setSearchParams({}, { replace: true });
            }
        }
    }, [searchParams, materials, handlePreview, setSearchParams]);

    const folders = useMemo(
        () => materials.filter((m) => m.type === "folder"),
        [materials],
    );
    const files = useMemo(
        () => materials.filter((m) => m.type !== "folder"),
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

    useEffect(() => {
        if (shouldDownload && downloadLink.current) {
            downloadLink.current.click();
            setShouldDownload(false);
        }
    }, [shouldDownload]);

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
                                setValue={setSearchQuery}
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
                                            showCount={false}
                                            isSelected={false}
                                            onClick={() => {}}
                                            onDoubleClick={() =>
                                                handleCardDoubleClick(folder)
                                            }
                                            onDragStart={() => {}}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                            onCopy={() => {}}
                                            onMove={() => {}}
                                            onShare={() => {
                                                handleShareMaterials(
                                                    folderId,
                                                    folder.type,
                                                );
                                            }}
                                            onPreview={handlePreview}
                                            onDownload={handleDownload}
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
                                            isSelected={false}
                                            onClick={() => {}}
                                            onDoubleClick={() =>
                                                handleCardDoubleClick(file)
                                            }
                                            onDragStart={() => {}}
                                            onEdit={() => {}}
                                            onDelete={() => {}}
                                            onCopy={() => {}}
                                            onMove={() => {}}
                                            onShare={() => {
                                                handleShareMaterials(
                                                    fileId,
                                                    file.type,
                                                );
                                            }}
                                            onPreview={handlePreview}
                                            onDownload={handleDownload}
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

                {previewFile && (
                    <Preview
                        file_id={previewFile.id}
                        fileName={previewFile.name}
                        onClose={handleClosePreview}
                        onDownload={() =>
                            handleDownload(previewFile.id, previewFile.name)
                        }
                    />
                )}

                <a
                    href={fileToDownload?.url}
                    className="d-none"
                    download={fileToDownload?.name || "download"}
                    ref={downloadLink}
                />
            </div>
        </Layout>
    );
}
