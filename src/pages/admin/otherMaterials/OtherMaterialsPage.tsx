import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
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
import { handlePopupErrors, getErrorMessage } from "../../../utils/ErrorHandling";
import { downloadFile } from "../../../utils/FileDownloader";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useAppDispatch } from "../../../services/redux/Hooks";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { Banner } from "../../../components/banner/Banner";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Search } from "../../../components/forms/Search";
import { EmptySection } from "../../../components/materials/EmptySection";
import { MaterialCard } from "../../../components/materials/MaterialCard";
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

export function OtherMaterialsPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {
        studyType,
        departmentId,
        yearId,
        subjectId: routeSubjectId,
        parentId: routeParentId,
    } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");

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
    const subjectFilter = routeSubjectId ?? "";
    const currentParentId = routeParentId ? Number(routeParentId) : null;

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
            if (!subjectValue) {
                return `/admin/other-materials/${studyType}/${departmentId}/${yearId}`;
            }
            const subjectSegment = String(subjectValue);
            if (!parentValue) {
                return `/admin/other-materials/${studyType}/${departmentId}/${yearId}/${subjectSegment}`;
            }
            return `/admin/other-materials/${studyType}/${departmentId}/${yearId}/${subjectSegment}/${parentValue}`;
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
        },
        [buildMaterialsPath, navigate, subjectFilter],
    );

    const authQueryParams = useCallback(
        async () =>
            Promise.all([
                fetchDepartment(),
                fetchYear(),
                fetchSubjects(),
                fetchDestinationSubjects(),
                fetchMaterials(currentParentId),
            ]),
        [
            fetchDepartment,
            fetchYear,
            fetchSubjects,
            fetchDestinationSubjects,
            fetchMaterials,
            currentParentId,
        ],
    );

    useAuthQuery(authQueryParams);

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

    const handleCardClick = (material: MaterialResponseDto) => {
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

    const handleCopyMaterials = (materialId?: number) => {
        if (!materialId) return;
        setSelectedMaterials([materialId]);
        setShowDestinationPicker(true);
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
                } catch (error) {
                    const errorMessage = getErrorMessage(error) || "Operation failed";
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
                        navigate(`/admin/other-materials/${studyType}`)
                    }
                    onChangeDepartment={() =>
                        navigate(
                            `/admin/other-materials/${studyType}/${departmentId}`,
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
                                            isSelected={false}
                                            onClick={() =>
                                                handleCardClick(folder)
                                            }
                                            onDoubleClick={() => {
                                                handleCardClick(folder);
                                            }}
                                            onDragStart={() => {}}
                                            onCopy={() =>
                                                handleCopyMaterials(folderId)
                                            }
                                            onPreview={handlePreview}
                                            onDownload={handleDownload}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={false}
                                            className={styles.materialCard}
                                            showShare={false}
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
                                            isSelected={false}
                                            onClick={() =>
                                                handleCardClick(file)
                                            }
                                            onDoubleClick={() => {
                                                handleCardClick(file);
                                            }}
                                            onDragStart={() => {}}
                                            onCopy={() =>
                                                handleCopyMaterials(fileId)
                                            }
                                            onPreview={handlePreview}
                                            onDownload={handleDownload}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={false}
                                            className={styles.materialCard}
                                            showShare={false}
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
