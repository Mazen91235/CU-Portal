import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { useLazyGetCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import { useLazyGetDepartmentQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearQuery } from "../../../services/apis/admin/YearAPIs";
import {
    useLazyGetMaterialsQuery,
    useCreateMaterialMutation,
    useCopyMaterialsMutation,
} from "../../../services/apis/admin/MaterialAPIs";
import { useLazyGetMaterialParentsQuery } from "../../../services/apis/user/MaterialAPIs";
import { useLazyGetEnrolledCoursesQuery } from "../../../services/apis/user/CourseAPIs";
import type { MaterialResponseDto } from "../../../types/dtos/MaterialDtos";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import {
    handlePopupErrors,
    getErrorMessage,
} from "../../../utils/ErrorHandling";
import { downloadFile, downloadMaterials } from "../../../utils/FileDownloader";
import useAuthQuery from "../../../hooks/useAuthQuery";
import useFilterSearchParams from "../../../hooks/useFilterSearchParams";
import { useAppDispatch } from "../../../services/redux/Hooks";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Search } from "../../../components/forms/Search";
import { EmptySection } from "../../../components/materials/EmptySection";
import { MaterialCard } from "../../../components/materials/MaterialCard";
import { MaterialSelectionMenu } from "../../../components/materials/MaterialSelectionMenu";
import { Navigator } from "../../../components/materials/Navigator";
import { CrossSubjectDestinationPicker } from "../../../components/materials/CrossSubjectDestinationPicker";
import { OtherMaterialsScopeHeader } from "../../../components/materials/OtherMaterialsScopeHeader";
import { Preview } from "../../../components/preview/Preview";

import emptySectionIcon from "../../../assets/icons/materials-welcome.svg";
import folderEmptyIcon from "../../../assets/icons/folder-empty.jpg";

import styles from "./OtherMaterialsPage.module.css";
import { showToast } from "../../../utils/ToastsManager";
import { setProcess } from "../../../services/redux/reducers/ProcessReducer";
import { useCreateProcess } from "../../../hooks/useHandleProcesses";
import { copyToClipboard } from "../../../utils/ClipboardHandler";

export function OtherMaterialsPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { getFilter, getFilterSetter, searchParams, setSearchParams } = useFilterSearchParams();
    const studyType = getFilter("study_type", "");
    const departmentId = getFilter("department_id", "");
    const yearId = getFilter("year_id", "");
    const subjectFilter = getFilter("subject_id", "");
    const currentParentId = getFilter("parent_id", "")
        ? Number(getFilter("parent_id"))
        : null;
    const searchQuery = getFilter("query", "");
    const setSearchQuery = getFilterSetter("query");

    const [department, setDepartment] = useState<DepartmentResponseDto | null>(
        null,
    );
    const [year, setYear] = useState<YearResponseDto | null>(null);
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);
    const [destinationSubjects, setDestinationSubjects] = useState<
        SubjectResponseDto[]
    >([]);
    const [currentPath, setCurrentPath] = useState<MaterialResponseDto[]>([]);
    const [materials, setMaterials] = useState<MaterialResponseDto[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
    const [showDestinationPicker, setShowDestinationPicker] = useState(false);
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [getDepartment] = useLazyGetDepartmentQuery();
    const [getYear] = useLazyGetYearQuery();
    const [getSubjects] = useLazyGetCoursesQuery();
    const [getEnrolledSubjects] = useLazyGetEnrolledCoursesQuery();
    const [getMaterials] = useLazyGetMaterialsQuery();
    const [getMaterialParents] = useLazyGetMaterialParentsQuery();
    const [createMaterial] = useCreateMaterialMutation();
    const [copyMaterials] = useCopyMaterialsMutation();
    const createProcess = useCreateProcess({});

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
        if (!departmentId || !yearId) {
            setSubjects([]);
            return;
        }
        try {
            const result = await getSubjects({
                data: {
                    department_id: Number(departmentId),
                    year_id: Number(yearId),
                },
            }).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getSubjects, departmentId, yearId]);

    // The subjects the admin can actually copy into — their own department,
    // regardless of the foreign department/year currently being browsed.
    const fetchDestinationSubjects = useCallback(async () => {
        try {
            const result = await getEnrolledSubjects().unwrap();
            setDestinationSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [getEnrolledSubjects]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

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
                return "/admin/other-materials";
            }
            const params = new URLSearchParams(searchParams);
            params.set("study_type", studyType);
            params.set("department_id", departmentId);
            params.set("year_id", yearId);
            if (subjectValue) params.set("subject_id", String(subjectValue));
            else params.delete("subject_id");
            if (parentValue) params.set("parent_id", String(parentValue));
            else params.delete("parent_id");
            params.delete("material_id");
            return `/admin/other-materials/materials?${params.toString()}`;
        },
        [studyType, departmentId, yearId, searchParams],
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
        },
        [buildMaterialsPath, navigate, subjectFilter],
    );

    const authDepartmentQuery = useCallback(() => fetchDepartment(), [fetchDepartment]);
    const authYearQuery = useCallback(() => fetchYear(), [fetchYear]);
    const authSubjectsQuery = useCallback(() => fetchSubjects(), [fetchSubjects]);
    const authDestinationSubjectsQuery = useCallback(
        () => fetchDestinationSubjects(),
        [fetchDestinationSubjects],
    );
    const authMaterialsQuery = useCallback(
        () => fetchMaterials(currentParentId),
        [fetchMaterials, currentParentId],
    );

    useAuthQuery(authDepartmentQuery);
    useAuthQuery(authYearQuery);
    useAuthQuery(authSubjectsQuery);
    useAuthQuery(authDestinationSubjectsQuery);
    useAuthQuery(authMaterialsQuery);

    useEffect(() => {
        if (!studyType || !departmentId || !yearId) {
            navigate("/admin/other-materials", { replace: true });
        }
    }, [studyType, departmentId, yearId, navigate]);

    useEffect(() => {
        if (!subjectFilter) {
            setCurrentPath([]);
            setMaterials([]);
            return;
        }

        void loadCurrentPath(currentParentId);
    }, [loadCurrentPath, currentParentId, subjectFilter]);

    const handleCardClick = (materialId: number) => {
        if (isSelectionMode) {
            setSelectedMaterials((prev) =>
                prev.includes(materialId)
                    ? prev.filter((id) => id !== materialId)
                    : [...prev, materialId],
            );
        } else {
            setIsSelectionMode(true);
            setSelectedMaterials([materialId]);
        }
    };

    const handleCardDoubleClick = (material: MaterialResponseDto) => {
        if (material.material_type === "folder") {
            handleNavigate(material);
        }
    };

    const handlePreview = useCallback((fileId: string, fileName: string) => {
        setPreviewFile({ id: fileId, name: fileName });
    }, []);

    const handleClosePreview = () => {
        setPreviewFile(null);
    };

    const handleDownload = (fileId: string) => {
        downloadFile(fileId);
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
            const params = new URLSearchParams(searchParams);
            if (materialId !== undefined) params.set("material_id", String(materialId));
            url = `${window.location.origin}${url.split("?")[0]}?${params.toString()}`;
        } else {
            url =
                materials.find((material) => material.id === materialId)
                    ?.attachment?.url || "";
        }
        copyToClipboard(url);
        showToast(
            "success",
            "Success",
            "Material link copied to clipboard successfully",
        );
    };

    const handleCopyMaterials = (materialId?: number) => {
        if (materialId && !selectedMaterials.includes(materialId)) {
            setSelectedMaterials((prev) => [...prev, materialId]);
        }
        if (!materialId && selectedMaterials.length === 0) return;
        setShowDestinationPicker(true);
    };

    const handleDownloadSelected = useCallback(() => {
        if (selectedMaterials.length === 0) return;
        if (selectedMaterials.length === 1) {
            const selectedMaterial = materials.find(
                (material) => material.id === selectedMaterials[0],
            );
            const fileId =
                selectedMaterial?.material_type === "file"
                    ? selectedMaterial.attachment?.details?.file_data?.id
                    : undefined;
            if (fileId) {
                handleDownload(fileId);
                return;
            }
        }
        downloadMaterials(selectedMaterials);
    }, [selectedMaterials, materials]);

    const handleSelectAll = () => {
        if (selectedMaterials.length === materials.length) {
            setSelectedMaterials([]);
        } else {
            setSelectedMaterials(
                materials
                    .map((material) => material.id)
                    .filter((id): id is number => id !== undefined),
            );
        }
    };

    const handleCancelSelection = () => {
        setSelectedMaterials([]);
        setIsSelectionMode(false);
    };

    const fetchDestinationFolders = useCallback(
        async (subjectId: number, parentId: number | null | undefined) => {
            const response = await getMaterials({
                data: {
                    material_type: "folder",
                    subject_id: subjectId,
                    parent_id: parentId ?? null,
                },
            }).unwrap();
            return response.data || [];
        },
        [getMaterials],
    );

    const createDestinationFolder = useCallback(
        async (subjectId: number, name: string, parentId: number | null) => {
            await createMaterial({
                name,
                material_type: "folder",
                subject_id: subjectId,
                parent_id: parentId,
            }).unwrap();
        },
        [createMaterial],
    );

    const handleDestinationPickerClose = () => {
        setSelectedMaterials([]);
        setShowDestinationPicker(false);
    };

    const handleDestinationPickerConfirm = async (
        targetId: number | null,
        subjectId: number,
    ) => {
        if (selectedMaterials.length === 0) return;
        const processName = `Copying ${selectedMaterials.length} Material${selectedMaterials.length > 1 ? "s" : ""}`;
        const copiedMaterials = selectedMaterials;
        setSelectedMaterials([]);
        setShowDestinationPicker(false);
        try {
            createProcess(processName).then(async (process) => {
                try {
                    if (!process) {
                        showToast("error", "Error", "Failed to create process");
                        return;
                    }
                    await copyMaterials({
                        material_ids: copiedMaterials,
                        destination_id: targetId,
                        subject_id: subjectId,
                    }).unwrap();
                    dispatch(setProcess({ ...process, status: "completed" }));
                    await fetchMaterials(currentParentId);
                } catch (error) {
                    const errorMessage =
                        getErrorMessage(error) || "Operation failed";
                    dispatch(
                        setProcess({
                            ...process,
                            status: "failed",
                            reason: errorMessage,
                        }),
                    );
                }
            });
        } catch (error) {
            handlePopupErrors(error);
        }
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
            { value: "", label: "All Subjects" },
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
                title="Other Materials - CU Portal Admin"
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
                    onChangeHome={() => navigate("/admin/other-materials")}
                    onChangeStudyType={() =>
                        navigate(`/admin/other-materials?study_type=${studyType}`)
                    }
                    onChangeDepartment={() =>
                        navigate(
                            `/admin/other-materials/years?study_type=${studyType}&department_id=${departmentId}`,
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
                                setValue={setSearchQuery} value={searchQuery}
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
                            showCopy
                            onEnter={() => setIsSelectionMode(true)}
                            onCancel={handleCancelSelection}
                            onSelectAll={handleSelectAll}
                            onDownload={handleDownloadSelected}
                            onCopy={() => handleCopyMaterials()}
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
                                            onClick={handleCardClick}
                                            onDoubleClick={() =>
                                                handleCardDoubleClick(folder)
                                            }
                                            onDragStart={() => {}}
                                            onCopy={() =>
                                                handleCopyMaterials(folderId)
                                            }
                                            onShare={() =>
                                                handleShareMaterials(
                                                    folderId,
                                                    folder.material_type,
                                                )
                                            }
                                            onPreview={handlePreview}
                                            onDownload={handleDownload}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={false}
                                            className={styles.materialCard}
                                            showCopy
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
                                            onClick={handleCardClick}
                                            onDoubleClick={() =>
                                                handleCardDoubleClick(file)
                                            }
                                            onDragStart={() => {}}
                                            onCopy={() =>
                                                handleCopyMaterials(fileId)
                                            }
                                            onShare={() =>
                                                handleShareMaterials(
                                                    fileId,
                                                    file.material_type,
                                                )
                                            }
                                            onPreview={handlePreview}
                                            onDownload={handleDownload}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={false}
                                            className={styles.materialCard}
                                            showCopy
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

                {showDestinationPicker && (
                    <CrossSubjectDestinationPicker
                        materials={materials}
                        selectedMaterials={selectedMaterials}
                        destinationSubjects={destinationSubjects}
                        onClose={handleDestinationPickerClose}
                        onConfirm={handleDestinationPickerConfirm}
                        fetchFolders={fetchDestinationFolders}
                        createFolder={createDestinationFolder}
                    />
                )}
            </div>
        </Layout>
    );
}

export default OtherMaterialsPage;
