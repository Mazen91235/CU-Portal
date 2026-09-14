import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAppSelector } from "../../../services/redux/Hooks";
import { useLazyGetCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import { useLazyGetDepartmentQuery } from "../../../services/apis/user/DepartmentAPIs";
import { useLazyGetYearQuery } from "../../../services/apis/user/YearAPIs";
import {
    useLazyGetMaterialsQuery,
    useLazyGetMaterialParentsQuery,
} from "../../../services/apis/user/MaterialAPIs";
import type { MaterialResponseDto } from "../../../types/dtos/MaterialDtos";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { downloadFile, downloadMaterials } from "../../../utils/FileDownloader";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Search } from "../../../components/forms/Search";
import { EmptySection } from "../../../components/materials/EmptySection";
import { MaterialCard } from "../../../components/materials/MaterialCard";
import { MaterialSelectionMenu } from "../../../components/materials/MaterialSelectionMenu";
import { Navigator } from "../../../components/materials/Navigator";
import { OtherMaterialsScopeHeader } from "../../../components/materials/OtherMaterialsScopeHeader";
import { Preview } from "../../../components/preview/Preview";

import emptySectionIcon from "../../../assets/icons/materials-welcome.svg";
import folderEmptyIcon from "../../../assets/icons/folder-empty.jpg";

import styles from "./OtherMaterialsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";
import { showToast } from "../../../utils/ToastsManager";

export function OtherMaterialsPage() {
    const navigate = useNavigate();
    const {
        studyType,
        departmentId,
        yearId,
        subjectId: routeSubjectId,
        parentId: routeParentId,
    } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");

    const user = useAppSelector((state) => state.user.user);

    const [department, setDepartment] = useState<DepartmentResponseDto | null>(
        null,
    );
    const [year, setYear] = useState<YearResponseDto | null>(null);
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [currentPath, setCurrentPath] = useState<MaterialResponseDto[]>([]);
    const [materials, setMaterials] = useState<MaterialResponseDto[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [shouldDownload, setShouldDownload] = useState(false);
    const downloadLink = useRef<HTMLAnchorElement>(null);
    const subjectFilter = routeSubjectId ?? "";
    const currentParentId = routeParentId ? Number(routeParentId) : null;

    const [getDepartment] = useLazyGetDepartmentQuery();
    const [getYear] = useLazyGetYearQuery();
    const [getSubjects] = useLazyGetCoursesQuery();
    const [getMaterials] = useLazyGetMaterialsQuery();
    const [getMaterialParents] = useLazyGetMaterialParentsQuery();

    const fetchDepartment = useCallback(async () => {
        if (!departmentId) return;
        try {
            const response = await getDepartment({
                department_id: Number(departmentId),
            }).unwrap();
            setDepartment(response.data || null);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getDepartment, departmentId]);

    const fetchYear = useCallback(async () => {
        if (!yearId) return;
        try {
            const response = await getYear({
                year_id: Number(yearId),
            }).unwrap();
            setYear(response.data || null);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getYear, yearId]);

    const fetchSubjects = useCallback(async () => {
        if (!departmentId || !yearId || !user) {
            setSubjects([]);
            return;
        }
        try {
            const result = await getSubjects({
                data: {
                    faculty_id: user.faculty?.id ?? undefined,
                    department_id: Number(departmentId),
                    year_id: Number(yearId),
                },
            }).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getSubjects, departmentId, yearId, user]);

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
            if (!studyType || !departmentId || !yearId) {
                return "/user/other-materials";
            }
            if (!subjectValue) {
                return `/user/other-materials/${studyType}/${departmentId}/${yearId}`;
            }
            const subjectSegment = String(subjectValue);
            if (!parentValue) {
                return `/user/other-materials/${studyType}/${departmentId}/${yearId}/${subjectSegment}`;
            }
            return `/user/other-materials/${studyType}/${departmentId}/${yearId}/${subjectSegment}/${parentValue}`;
        },
        [studyType, departmentId, yearId],
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

    const authQueryParams = useCallback(
        async () =>
            Promise.all([
                fetchDepartment(),
                fetchYear(),
                fetchSubjects(),
                fetchMaterials(currentParentId),
            ]),
        [
            fetchDepartment,
            fetchYear,
            fetchSubjects,
            fetchMaterials,
            currentParentId,
        ],
    );

    useAuthQuery(authQueryParams);

    useEffect(() => {
        if (!studyType || !departmentId || !yearId) {
            navigate("/user/other-materials", { replace: true });
        }
    }, [studyType, departmentId, yearId, navigate]);

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
            if (material.material_type === "folder") {
                handleNavigate(material);
            }
        },
        [handleNavigate],
    );

    const handleDownloadSelected = useCallback(() => {
        if (selectedMaterials.length === 0) return;
        downloadMaterials(selectedMaterials);
    }, [selectedMaterials]);

    const handleSelectAll = useCallback(() => {
        const materialIds = materials
            .map((material) => material.id)
            .filter((id): id is number => id !== undefined);
        setSelectedMaterials((prev) =>
            prev.length === materialIds.length ? [] : materialIds,
        );
    }, [materials]);

    const handleCancelSelection = useCallback(() => {
        setSelectedMaterials([]);
        setIsSelectionMode(false);
    }, []);

    const handlePreview = useCallback((fileId: string, fileName: string) => {
        setPreviewFile({ id: fileId, name: fileName });
    }, []);

    const handleClosePreview = () => {
        setPreviewFile(null);
    };

    const handleDownload = async (fileId: string) => {
        try {
            downloadFile(fileId);
        } catch (error) {
            handlePopupErrors(error);
        }
    };

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
            url += `?material_id=${materialId}`;
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
                setSearchParams({}, { replace: true });
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
            { value: "", label: "All Subjects" },
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
                title="Other Materials - CU Portal"
                description="Browse course materials from other departments"
            />
            <Banner
                title="Other Materials"
                description="Browse course materials from other departments and years"
            />
            <div className={styles.container}>
                <OtherMaterialsScopeHeader
                    studyTypeName={studyType}
                    departmentName={department?.name}
                    yearName={year?.year?.toString()}
                    onChangeHome={() => navigate("/user/other-materials")}
                    onChangeStudyType={() =>
                        navigate(`/user/other-materials/${studyType}`)
                    }
                    onChangeDepartment={() =>
                        navigate(
                            `/user/other-materials/${studyType}/${departmentId}`,
                        )
                    }
                />

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
                        <MaterialSelectionMenu
                            isSelectionMode={isSelectionMode}
                            selectedCount={selectedMaterials.length}
                            totalCount={materials.length}
                            onEnter={() => setIsSelectionMode(true)}
                            onCancel={handleCancelSelection}
                            onSelectAll={handleSelectAll}
                            onDownload={handleDownloadSelected}
                        />
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
                            Browse Other Materials
                        </div>
                        <div className={styles.filterPageSubtitle}>
                            Select a subject above to view its materials.
                        </div>
                    </div>
                )}

                {previewFile && (
                    <Preview
                        file_id={previewFile.id}
                        fileName={previewFile.name}
                        onClose={handleClosePreview}
                        onDownload={() => handleDownload(previewFile.id)}
                    />
                )}
            </div>
        </Layout>
    );
}

export default OtherMaterialsPage;
