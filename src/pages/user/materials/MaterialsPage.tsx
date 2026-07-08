import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const [materialFromUrl, setMaterialFromUrl] = useState<{
        id?: number;
        subject_id?: number;
        parent_id?: number | null;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");

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

            if (!parentId)
                parentId =
                    currentPath.length > 0
                        ? currentPath[currentPath.length - 1].id
                        : null;

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
        [subjectFilter, currentPath, searchQuery, getMaterials],
    );

    useEffect(() => {
        setCurrentPath([]);
    }, [subjectFilter]);

    const handleNavigate = useCallback(
        async (material: Material | null) => {
            if (material === null) {
                setCurrentPath([]);
            } else {
                if (!material.id) {
                    return;
                }
                try {
                    const response = await getMaterialParents({
                        material_id: material.id,
                    }).unwrap();
                    setCurrentPath([...(response.data || [])]);
                } catch (error) {
                    handlePopupErrors(error);
                }
            }
        },
        [getMaterialParents],
    );

    const handleMatrialFromUrl = useCallback(() => {
        if (materialFromUrl?.subject_id) {
            setSubjectFilter(materialFromUrl.subject_id.toString());
            setMaterialFromUrl(
                (prev) => prev && { ...prev, subject_id: undefined },
            );
        }
        if (materialFromUrl?.parent_id) {
            handleNavigate({
                id: materialFromUrl.parent_id || null,
            } as Material);
            setMaterialFromUrl(
                (prev) => prev && { ...prev, parent_id: undefined },
            );
        }
    }, [materialFromUrl, handleNavigate]);

    const authQueryParams = useCallback(
        async () =>
            Promise.all([
                fetchSubjects(),
                fetchMaterials(),
                handleMatrialFromUrl(),
            ]),
        [fetchSubjects, fetchMaterials, handleMatrialFromUrl],
    );

    useAuthQuery(authQueryParams);

    const handleCardClick = (material: Material) => {
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
        let url =
            window.location.origin +
            "/user/materials?subject_id=" +
            subjectFilter;
        const parentId =
            currentPath.length > 0
                ? currentPath[currentPath.length - 1].id
                : null;
        if (type === "folder") {
            url += "&parent_id=" + materialId;
        } else if (type === "file") {
            url += `&parent_id=${parentId}&material_id=${materialId}`;
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
        if (searchParams) {
            const material_id = searchParams.get("material_id");
            const subject_id = searchParams.get("subject_id");
            const parent_id = searchParams.get("parent_id");
            if (material_id || subject_id || parent_id) {
                setMaterialFromUrl({
                    id: material_id ? parseInt(material_id) : undefined,
                    subject_id: subject_id ? parseInt(subject_id) : undefined,
                    parent_id: parent_id ? parseInt(parent_id) : undefined,
                });
                setSearchParams({});
            }
        }
    }, [searchParams, setSearchParams, handleNavigate]);

    useEffect(() => {
        if (materialFromUrl && materialFromUrl.id && materials.length > 0) {
            const material = materials.find((m) => m.id === materialFromUrl.id);
            if (material) {
                handlePreview(
                    material.details?.file_data?.id || "",
                    material.name || "Preview",
                );
                setMaterialFromUrl(null);
            }
        }
    }, [materialFromUrl, materials, handlePreview]);

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
                            if (value !== subjectFilter) setCurrentPath([]);
                            setSubjectFilter(value);
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
                                            navigatePerClick={true}
                                            onClick={() => handleCardClick(folder)}
                                            onDoubleClick={() =>{}}
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
                                            onClick={() => handleCardClick(file)}
                                            onDoubleClick={() =>{}}
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
