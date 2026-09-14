import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import type { MaterialType } from "../../../types/entities/Material";
import { useLazyGetFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazyGetDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazyGetYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { useLazyGetCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import {
    useLazyGetMaterialsQuery,
    useCreateMaterialMutation,
    useUpdateMaterialMutation,
    useDeleteMaterialsMutation,
    useCopyMaterialsMutation,
    useMoveMaterialsMutation,
    useFetchMaterialsFromDriveMutation,
} from "../../../services/apis/admin/MaterialAPIs";
import { useLazyGetMaterialParentsQuery } from "../../../services/apis/user/MaterialAPIs";
import type { MaterialResponseDto } from "../../../types/dtos/MaterialDtos";
import type { FacultyResponseDto } from "../../../types/dtos/FacultyDtos";
import type { DepartmentResponseDto } from "../../../types/dtos/DepartmentDtos";
import type { YearResponseDto } from "../../../types/dtos/YearDtos";
import type { SubjectResponseDto } from "../../../types/dtos/SubjectDtos";
import { showToast } from "../../../utils/ToastsManager";
import {
    handlePopupErrors,
    getErrorMessage,
} from "../../../utils/ErrorHandling";
import { downloadFile, downloadMaterials } from "../../../utils/FileDownloader";
import useAuthQuery from "../../../hooks/useAuthQuery";
import { useAppDispatch, useAppSelector } from "../../../services/redux/Hooks";
import { PageSeo } from "../../../components/PageSeo";
import { Layout } from "../../../components/layout/Layout";
import { SelectFilter } from "../../../components/forms/SelectFilter";
import { Search } from "../../../components/forms/Search";
import { EmptySection } from "../../../components/materials/EmptySection";
import { MaterialCard } from "../../../components/materials/MaterialCard";
import { MaterialForm } from "../../../components/materials/MaterialForm";
import { FetchFromDriveForm } from "../../../components/materials/FetchFromDriveForm";
import { Navigator } from "../../../components/materials/Navigator";
import { FloatingContainer } from "../../../components/materials/FloatingContainer";
import { Preview } from "../../../components/preview/Preview";
import ConfirmModal from "../../../components/modal/ConfirmModal";
import { DropZone } from "../../../components/materials/DropZone";
import { BulkUploadModal } from "../../../components/materials/BulkUploadModal";
import { MaterialSelectionMenu } from "../../../components/materials/MaterialSelectionMenu";

import emptySectionIcon from "../../../assets/icons/materials-welcome.svg";
import folderEmptyIcon from "../../../assets/icons/folder-empty.jpg";
import { Banner } from "../../../components/banner/Banner";
import type { Process } from "../../../types/Process";
import type { GenericAPIResponse } from "../../../types/responses/GenericAPIResponse";
import { setProcess } from "../../../services/redux/reducers/ProcessReducer";
import { useCreateProcess } from "../../../hooks/useHandleProcesses";
import styles from "./MaterialsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";

export function MaterialsPage() {
    const navigate = useNavigate();
    const { subjectId: routeSubjectId, parentId: routeParentId } = useParams();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.user);
    const [searchParams, setSearchParams] = useSearchParams();
    const authorId = searchParams.get("author_id");
    const [searchQuery, setSearchQuery] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [draggedFilesState, setDraggedFilesState] = useState({
        active: false,
        x: 0,
        y: 0,
    });

    const [faculties, setFaculties] = useState<FacultyResponseDto[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
    const [years, setYears] = useState<YearResponseDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectResponseDto[]>([]);

    const [currentPath, setCurrentPath] = useState<MaterialResponseDto[]>([]);
    const [materials, setMaterials] = useState<MaterialResponseDto[]>([]);
    const [floatingFolders, setFloatingFolders] = useState<
        MaterialResponseDto[]
    >([]);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [formData, setFormData] = useState<{
        show: boolean;
        type: "folder" | "file" | "drive" | "youtube" | "external" | null;
        material: MaterialResponseDto | null;
    }>({ show: false, type: null, material: null });
    const [showFetchFromDriveForm, setShowFetchFromDriveForm] = useState(false);
    const [floatingContainer, setFloatingContainer] = useState<{
        show: boolean;
        operation: "copy" | "move";
        targetPath: MaterialResponseDto[];
    }>({ show: false, operation: "copy", targetPath: [] });
    const [previewFile, setPreviewFile] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        action: "delete" | "bulkDelete" | "move" | null;
        targetId?: number | null;
        materialId?: number;
    }>({ isOpen: false, action: null });
    const [dropZoneVisible, setDropZoneVisible] = useState(false);
    const [bulkUploadFiles, setBulkUploadFiles] = useState<File[] | null>(null);
    const [isDraggingExternal, setIsDraggingExternal] = useState(false);
    const subjectFilter = routeSubjectId ?? "";
    const currentParentId = routeParentId ? Number(routeParentId) : null;

    const [searchFaculties] = useLazyGetFacultiesQuery();
    const [searchDepartments] = useLazyGetDepartmentsQuery();
    const [searchYears] = useLazyGetYearsQuery();
    const [searchCourses] = useLazyGetCoursesQuery();
    const [getMaterials] = useLazyGetMaterialsQuery();
    const [getMaterialParents] = useLazyGetMaterialParentsQuery();
    const [createMaterial] = useCreateMaterialMutation();
    const [updateMaterial] = useUpdateMaterialMutation();
    const [deleteMaterials, { isLoading: isDeleting }] =
        useDeleteMaterialsMutation();
    const [copyMaterials] = useCopyMaterialsMutation();
    const [moveMaterials, { isLoading: isMoving }] = useMoveMaterialsMutation();
    const [getMaterialsFromDrive] = useFetchMaterialsFromDriveMutation();
    const createProcess = useCreateProcess({});

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
            if (!facultyFilter) {
                setDepartments([]);
                return;
            }
            const result = await searchDepartments({
                data: {
                    faculty_id: parseInt(facultyFilter) || undefined,
                },
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, facultyFilter]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({ data: {} }).unwrap();
            setYears(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchYears]);

    const fetchSubjects = useCallback(async () => {
        try {
            if (!user) return;
            const params: {
                faculty_id?: number;
                department_id?: number;
                year_id?: number;
            } = {};
            if (facultyFilter) params.faculty_id = parseInt(facultyFilter);
            if (departmentFilter)
                params.department_id = parseInt(departmentFilter);
            if (yearFilter) params.year_id = parseInt(yearFilter);

            if (!user.canAccessAll) {
                params.faculty_id = user.faculty?.id ?? undefined;
                setFacultyFilter(user.faculty?.id?.toString() || "");
                params.department_id = user.department?.id ?? undefined;
                setDepartmentFilter(user.department?.id?.toString() || "");
                params.year_id = user.year?.id ?? undefined;
                setYearFilter(user.year?.id?.toString() || "");
            }

            if (Object.keys(params).length < 3) {
                setSubjects([]);
                return;
            }

            const result = await searchCourses({ data: params }).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchCourses, facultyFilter, departmentFilter, yearFilter, user]);

    const fetchMaterials = useCallback(
        async (parentId?: number | null) => {
            if (!subjectFilter) return;

            try {
                const response = await getMaterials({
                    data: {
                        subject_id: parseInt(subjectFilter),
                        parent_id: parentId ?? null,
                        query: searchQuery || undefined,
                        author_id: authorId ? parseInt(authorId) : undefined,
                    },
                    includes: ["subject", "children", "attachment"],
                }).unwrap();
                setMaterials(response.data || []);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [subjectFilter, searchQuery, getMaterials, authorId], 
    );

    const fetchFolders = useCallback(
        async (parentId?: number | null) => {
            if (!subjectFilter) return;

            try {
                const response = await getMaterials({
                    data: {
                        material_type: "folder",
                        subject_id: parseInt(subjectFilter),
                        parent_id: parentId ?? undefined,
                        author_id: authorId ? parseInt(authorId) : undefined,
                    },
                }).unwrap();
                setFloatingFolders(response.data || []);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [subjectFilter, getMaterials, authorId],
    );

    const buildMaterialsPath = useCallback(
        (
            subjectValue?: string | number | null,
            parentValue?: string | number | null,
        ) => {
            if (!subjectValue) return "/admin/materials";
            const subjectSegment = String(subjectValue);
            if (!parentValue) {
                return `/admin/materials/${subjectSegment}`;
            }
            return `/admin/materials/${subjectSegment}/${parentValue}`;
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

    useEffect(() => {
        setSelectedMaterials([]);
        setIsSelectionMode(false);
    }, [facultyFilter, departmentFilter, yearFilter, subjectFilter]);

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
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
                fetchSubjects(),
                fetchMaterials(currentParentId),
                fetchFolders(currentParentId),
            ]),
        [
            fetchFaculties,
            fetchDepartments,
            fetchYears,
            fetchSubjects,
            fetchMaterials,
            fetchFolders,
            currentParentId,
        ],
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

    const handleDragStart = (materialId: number) => {
        if (!selectedMaterials.includes(materialId)) {
            setSelectedMaterials([materialId]);
        }
        setDraggedFilesState({ ...draggedFilesState, active: true });
        document.addEventListener("mousemove", handleDragMove);
        document.addEventListener("mouseup", handleDragEnd);
    };

    const handleDragMove = (e: MouseEvent) => {
        setDraggedFilesState({
            active: true,
            x: e.clientX + 10,
            y: e.clientY + 10,
        });
    };

    const handleDragEnd = () => {
        setDraggedFilesState({ active: false, x: 0, y: 0 });
        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
    };

    const handleDropOnFolder = async (targetId: number | null) => {
        if (selectedMaterials.length === 0) return;

        setConfirmModal({
            isOpen: true,
            action: "move",
            targetId: targetId,
        });
    };

    const confirmMove = async (targetId: number | null) => {
        if (selectedMaterials.length === 0) return;
        const processName = `Moving ${selectedMaterials.length} Material${selectedMaterials.length > 1 ? "s" : ""}`;
        setSelectedMaterials([]);
        setIsSelectionMode(false);
        setConfirmModal({ isOpen: false, action: null, targetId: null });
        try {
            createProcess(processName).then(async (process) => {
                try {
                    await moveMaterials({
                        material_ids: selectedMaterials,
                        destination_id: targetId,
                        subject_id: parseInt(subjectFilter),
                    }).unwrap();
                    dispatch(setProcess({ ...process, status: "completed" }));
                    setCurrentPath((prev) => {
                        const latestParentId =
                            prev.length > 0 ? prev[prev.length - 1].id : null;
                        fetchMaterials(latestParentId);
                        return prev;
                    });
                } catch (error) {
                    const errorMessage =
                        getErrorMessage(error) || "Move failed";
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

    const handleCreateMaterial = (
        type: "folder" | "file" | "drive" | "youtube" | "external",
    ) => {
        setFormData({ show: true, type, material: null });
    };

    const handleEditMaterial = (material: MaterialResponseDto) => {
        const materialType = material.material_type as
            | "folder"
            | "file"
            | "drive"
            | "youtube"
            | "external";
        setFormData({ show: true, type: materialType, material });
    };

    const handleDeleteMaterials = async (materialId?: number) => {
        if (!materialId && selectedMaterials.length === 0) return;

        if (materialId) {
            setConfirmModal({
                isOpen: true,
                action: "delete",
                materialId: materialId,
            });
        } else {
            setConfirmModal({
                isOpen: true,
                action: "bulkDelete",
            });
        }
    };

    const confirmDelete = async () => {
        const materialId = confirmModal.materialId;
        const materialIds = materialId ? [materialId] : selectedMaterials;

        if (materialIds.length === 0) return;

        try {
            await deleteMaterials({ material_ids: materialIds }).unwrap();
            showToast(
                "success",
                "Success",
                materialIds.length > 1
                    ? "Materials deleted successfully"
                    : "Material deleted successfully",
            );
            setSelectedMaterials([]);
            setIsSelectionMode(false);
            setConfirmModal({ isOpen: false, action: null });
            await fetchMaterials();
        } catch (error) {
            handlePopupErrors(error);
            setConfirmModal({ isOpen: false, action: null });
        }
    };

    const handleSelectAll = () => {
        if (selectedMaterials.length === materials.length) {
            setSelectedMaterials([]);
        } else {
            setSelectedMaterials(
                materials
                    .map((m) => m.id)
                    .filter((id): id is number => id !== undefined),
            );
        }
    };

    const handleCancelSelection = () => {
        setSelectedMaterials([]);
        setIsSelectionMode(false);
    };

    const handleFormSubmit = useCallback(
        async (data: FormData, uploadResult?: Process) => {
            try {
                const material = formData.material;
                const name = data.get("name") as string;
                const material_type = data.get("material_type") as MaterialType;
                const url = data.get("url") as string | null;
                const parent_id = data.get("parent_id") as string | null;
                let result: GenericAPIResponse<MaterialResponseDto>;
                if (material && material.id) {
                    result = await updateMaterial({
                        material_id: material.id,
                        name,
                        material_type,
                        details: {
                            url: url,
                        },
                    }).unwrap();
                } else {
                    result = await createMaterial({
                        subject_id: parseInt(subjectFilter),
                        name,
                        material_type,
                        details: {
                            url: url,
                        },
                        parent_id: parent_id ? parseInt(parent_id) : null,
                    }).unwrap();
                }
                if (!uploadResult) {
                    showToast(
                        "success",
                        "Success",
                        material && material.id
                            ? "Material updated successfully"
                            : "Material created successfully",
                    );
                } else {
                    const url = `${buildMaterialsPath(subjectFilter, currentPath[currentPath.length - 1]?.id ?? null)}?material_id=${result.data?.id}`;
                    dispatch(
                        setProcess({
                            ...uploadResult,
                            status: "completed",
                            url,
                        }),
                    );
                }
                setCurrentPath((prev) => {
                    const latestParentId =
                        prev.length > 0 ? prev[prev.length - 1].id : null;
                    fetchMaterials(latestParentId);
                    return prev;
                });
                setFormData({ show: false, type: null, material: null });
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [
            createMaterial,
            dispatch,
            fetchMaterials,
            buildMaterialsPath,
            subjectFilter,
            currentPath,
            updateMaterial,
            formData,
        ],
    );

    const handleCopyMaterials = (materialId?: number) => {
        if (materialId && !selectedMaterials.includes(materialId)) {
            setSelectedMaterials([...selectedMaterials, materialId]);
            setIsSelectionMode(true);
        }
        const parentId =
            currentPath.length > 0
                ? currentPath[currentPath.length - 1].id
                : null;
        fetchFolders(parentId);
        setFloatingContainer({
            show: true,
            operation: "copy",
            targetPath: currentPath,
        });
    };

    const handleMoveMaterials = (materialId?: number) => {
        if (materialId && !selectedMaterials.includes(materialId)) {
            setSelectedMaterials([...selectedMaterials, materialId]);
            setIsSelectionMode(true);
        }
        const parentId =
            currentPath.length > 0
                ? currentPath[currentPath.length - 1].id
                : null;
        fetchFolders(parentId);
        setFloatingContainer({
            show: true,
            operation: "move",
            targetPath: currentPath,
        });
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

    const handleOpenLink = (url: string) => {
        window.open(url, "_blank");
    };

    const handleFloatingNavigate = async (folderId: number | null) => {
        if (folderId === null) {
            setFloatingContainer((prev) => ({ ...prev, targetPath: [] }));
        } else {
            try {
                const response = await getMaterialParents({
                    material_id: folderId,
                }).unwrap();
                setFloatingContainer((prev) => ({
                    ...prev,
                    targetPath: [...(response.data || [])],
                }));
            } catch (error) {
                handlePopupErrors(error);
            }
        }
        await fetchFolders(folderId);
    };

    const handleFloatingConfirm = async (targetId: number | null) => {
        if (selectedMaterials.length === 0) return;
        const processName = `${floatingContainer.operation === "copy" ? "Copying" : "Moving"} ${selectedMaterials.length} Material${selectedMaterials.length > 1 ? "s" : ""}`;
        setSelectedMaterials([]);
        setIsSelectionMode(false);
        setFloatingContainer({
            show: false,
            operation: "copy",
            targetPath: [],
        });
        try {
            createProcess(processName).then(async (process) => {
                try {
                    if (!process) {
                        showToast("error", "Error", "Failed to create process");
                        return;
                    }
                    if (floatingContainer.operation === "copy") {
                        await copyMaterials({
                            material_ids: selectedMaterials,
                            destination_id: targetId,
                            subject_id: parseInt(subjectFilter),
                        }).unwrap();
                    } else {
                        await moveMaterials({
                            material_ids: selectedMaterials,
                            destination_id: targetId,
                            subject_id: parseInt(subjectFilter),
                        }).unwrap();
                    }
                    dispatch(setProcess({ ...process, status: "completed" }));
                    setCurrentPath((prev) => {
                        const latestParentId =
                            prev.length > 0 ? prev[prev.length - 1].id : null;
                        fetchMaterials(latestParentId);
                        return prev;
                    });
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

    const handleCreateFolderInFloating = async (
        name: string,
        parentId: number | null,
    ) => {
        try {
            await createMaterial({
                name: name,
                material_type: "folder",
                parent_id: parentId ?? undefined,
                subject_id: parseInt(subjectFilter),
            }).unwrap();

            showToast("success", "Success", "Folder created successfully");
            // Refresh the materials list in the floating container
            if (parentId === null) {
                setFloatingContainer((prev) => ({ ...prev, targetPath: [] }));
            }

            await fetchFolders(parentId ?? undefined);
        } catch (error) {
            handlePopupErrors(error);
            throw error;
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

    const facultyOptions = useMemo(
        () => [
            { value: "", label: "All Faculties" },
            ...faculties.map((faculty) => ({
                value: faculty.id?.toString() || "",
                label: faculty.name || "",
            })),
        ],
        [faculties],
    );

    const departmentOptions = useMemo(
        () => [
            { value: "", label: "All Departments" },
            ...departments.map((dept) => ({
                value: dept.id?.toString() || "",
                label: dept.name || "",
            })),
        ],
        [departments],
    );

    const yearOptions = useMemo(
        () => [
            { value: "", label: "All Years" },
            ...years.map((year) => ({
                value: year.id?.toString() || "",
                label: year.year?.toString() || "",
            })),
        ],
        [years],
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

    // Handle global drag events for file upload
    useEffect(() => {
        const handleDocumentDragOver = (e: DragEvent) => {
            e.preventDefault();
            if (
                isDraggingExternal ||
                !facultyFilter ||
                !departmentFilter ||
                !yearFilter ||
                !subjectFilter ||
                bulkUploadFiles ||
                formData.show
            )
                return;
            // Check if dragging files
            if (
                e.dataTransfer?.items &&
                Array.from(e.dataTransfer.items).some(
                    (item) => item.kind === "file",
                )
            ) {
                setDropZoneVisible(true);
                setIsDraggingExternal(true);
            }
        };
        const handleDocumentMouseLeave = (e: MouseEvent) => {
            e.preventDefault();
            // Check if actually leaving the document
            if (
                e.clientX <= 0 ||
                e.clientY <= 0 ||
                e.clientX >= window.innerWidth ||
                e.clientY >= window.innerHeight
            ) {
                setDropZoneVisible(false);
                setIsDraggingExternal(false);
            }
        };

        document.addEventListener("dragover", handleDocumentDragOver);
        document.addEventListener("mouseleave", handleDocumentMouseLeave);

        return () => {
            document.removeEventListener("dragover", handleDocumentDragOver);
            document.removeEventListener(
                "mouseleave",
                handleDocumentMouseLeave,
            );
        };
    }, [
        isDraggingExternal,
        facultyFilter,
        departmentFilter,
        yearFilter,
        subjectFilter,
        bulkUploadFiles,
        formData.show,
    ]);

    const handleDropZoneFilesSelected = (files: File[]) => {
        if (!subjectFilter) {
            showToast(
                "error",
                "Error",
                "Please select all filters before uploading files",
            );
            return;
        }
        setBulkUploadFiles(files);
    };

    const handleDropZoneClose = () => {
        setDropZoneVisible(false);
        setIsDraggingExternal(false);
    };

    const handleBulkUploadClose = () => {
        setBulkUploadFiles(null);
    };

    const handleCreateMaterialFromUpload = useCallback(
        async (uploadResult: Process): Promise<void> => {
            const parentId =
                currentPath.length > 0
                    ? currentPath[currentPath.length - 1].id
                    : null;

            const result = await createMaterial({
                name: uploadResult.name,
                material_type: "file",
                subject_id: parseInt(subjectFilter),
                parent_id: parentId ?? undefined,
                details: {
                    url: uploadResult.url,
                },
            }).unwrap();

            const url = `${buildMaterialsPath(subjectFilter, currentPath[currentPath.length - 1]?.id ?? null)}?material_id=${result.data?.id}`;

            dispatch(setProcess({ ...uploadResult, status: "completed", url }));
            setCurrentPath((prev) => {
                const latestParentId =
                    (prev.length > 0 ? prev[prev.length - 1] : null)?.id ??
                    null;
                fetchMaterials(latestParentId);
                return prev;
            });
        },
        [
            createMaterial,
            dispatch,
            fetchMaterials,
            buildMaterialsPath,
            subjectFilter,
            currentPath,
        ],
    );

    const handleFetchFromDrive = useCallback(
        (url: string) => {
            const parentId =
                currentPath.length > 0
                    ? currentPath[currentPath.length - 1].id
                    : null;
            createProcess("Fetching from Drive").then(async (process) => {
                try {
                    await getMaterialsFromDrive({
                        url,
                        subject_id: parseInt(subjectFilter),
                        parent_id: parentId ?? undefined,
                    }).unwrap();
                    dispatch(setProcess({ ...process, status: "completed" }));
                    setCurrentPath((prev) => {
                        const latestParentId =
                            prev.length > 0 ? prev[prev.length - 1].id : null;
                        fetchMaterials(latestParentId);
                        return prev;
                    });
                } catch (error) {
                    const errorMessage =
                        getErrorMessage(error) || "Fetch failed";
                    dispatch(
                        setProcess({
                            ...process,
                            status: "failed",
                            reason: errorMessage,
                        }),
                    );
                }
            });
        },
        [
            currentPath,
            subjectFilter,
            createProcess,
            dispatch,
            getMaterialsFromDrive,
            fetchMaterials,
        ],
    );

    const showFilterPage = !subjectFilter;
    const showEmptyPage = subjectFilter && materials.length === 0;
    const showContentPage = subjectFilter && materials.length > 0;

    return (
        <Layout>
            <PageSeo
                title="Materials Explorer - CU Portal"
                description="Navigate through your course materials with ease"
            />
            <Banner
                title="Materials Explorer"
                description="Navigate through your course materials with ease"
            />
            <div className={styles.container}>
                <div className={styles.filtersSection}>
                    {user?.canAccessAll && (
                        <>
                            <SelectFilter
                                options={facultyOptions}
                                setValue={(value) => {
                                    if (
                                        facultyFilter &&
                                        value != facultyFilter
                                    ) {
                                        navigate(buildMaterialsPath("", ""));
                                    }
                                    setFacultyFilter(value);
                                }}
                                value={facultyFilter}
                            />
                            <SelectFilter
                                options={departmentOptions}
                                setValue={(value) => {
                                    if (
                                        departmentFilter &&
                                        value != departmentFilter
                                    ) {
                                        navigate(buildMaterialsPath("", ""));
                                    }
                                    setDepartmentFilter(value);
                                }}
                                value={departmentFilter}
                            />
                            <SelectFilter
                                options={yearOptions}
                                setValue={(value) => {
                                    if (yearFilter && value != yearFilter) {
                                        navigate(buildMaterialsPath("", ""));
                                    }
                                    setYearFilter(value);
                                }}
                                value={yearFilter}
                            />
                        </>
                    )}
                    <SelectFilter
                        options={subjectOptions}
                        setValue={(value) => {
                            navigate(
                                buildMaterialsPath(
                                    typeof value === "string" ? value : "",
                                    null,
                                ),
                            );
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
                        <div className={styles.actionsContainer}>
                            <button
                                className={`${styles.actionButton} ${styles.addFolderBtn}`}
                                onClick={() => handleCreateMaterial("folder")}
                            >
                                <i className="fa-regular fa-folder"></i>
                                Add Folder
                            </button>
                            <button
                                className={`${styles.actionButton} ${styles.addFileBtn}`}
                                onClick={() => handleCreateMaterial("file")}
                            >
                                <i className="fa-regular fa-file"></i>
                                Add File
                            </button>
                            <button
                                className={`${styles.actionButton} ${styles.fetchBtn}`}
                                onClick={() => setShowFetchFromDriveForm(true)}
                            >
                                <i className="fab fa-google-drive"></i>
                                Fetch From Drive
                            </button>
                        </div>
                    </div>
                )}

                {showContentPage && (
                    <>
                        <Navigator
                            path={currentPath}
                            onNavigate={handleNavigate}
                            onDrop={handleDropOnFolder}
                            isDraggingGlobal={draggedFilesState.active}
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
                                            isSelected={selectedMaterials.includes(
                                                folderId,
                                            )}
                                            isSelectionMode={isSelectionMode}
                                            onClick={() =>
                                                handleCardClick(folderId)
                                            }
                                            onDoubleClick={() =>
                                                handleCardDoubleClick(folder)
                                            }
                                            onDragStart={() =>
                                                handleDragStart(folderId)
                                            }
                                            onDrop={() =>
                                                handleDropOnFolder(folderId)
                                            }
                                            onEdit={() =>
                                                handleEditMaterial(folder)
                                            }
                                            onDelete={() =>
                                                handleDeleteMaterials(folderId)
                                            }
                                            onCopy={() =>
                                                handleCopyMaterials(folderId)
                                            }
                                            onMove={() =>
                                                handleMoveMaterials(folderId)
                                            }
                                            onShare={() => {
                                                handleShareMaterials(
                                                    folderId,
                                                    folder.material_type,
                                                );
                                            }}
                                            onPreview={handlePreview}
                                            onDownload={handleDownloadFile}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={
                                                draggedFilesState.active
                                            }
                                            showCount={true}
                                            showAll={true}
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
                                            isSelected={selectedMaterials.includes(
                                                fileId,
                                            )}
                                            isSelectionMode={isSelectionMode}
                                            onClick={() =>
                                                handleCardClick(fileId)
                                            }
                                            onDoubleClick={() =>
                                                handleCardDoubleClick(file)
                                            }
                                            onDragStart={() =>
                                                handleDragStart(fileId)
                                            }
                                            onEdit={() =>
                                                handleEditMaterial(file)
                                            }
                                            onDelete={() =>
                                                handleDeleteMaterials(fileId)
                                            }
                                            onCopy={() =>
                                                handleCopyMaterials(fileId)
                                            }
                                            onMove={() =>
                                                handleMoveMaterials(fileId)
                                            }
                                            onShare={() => {
                                                handleShareMaterials(
                                                    fileId,
                                                    file.material_type,
                                                );
                                            }}
                                            onPreview={handlePreview}
                                            onDownload={handleDownloadFile}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={
                                                draggedFilesState.active
                                            }
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
                            onDrop={handleDropOnFolder}
                            isDraggingGlobal={draggedFilesState.active}
                        />
                        <EmptySection
                            text="No Files Available"
                            subtitle="There are currently no files in this folder. Upload or add new materials to get started."
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
                            Easily browse, search, and manage your course
                            materials. Use the filters above to find exactly
                            what you need.
                        </div>
                    </div>
                )}

                {showContentPage && (
                    <MaterialSelectionMenu
                        isSelectionMode={isSelectionMode}
                        selectedCount={selectedMaterials.length}
                        totalCount={materials.length}
                        showCopy
                        showMove
                        showDelete
                        onEnter={() => setIsSelectionMode(true)}
                        onCancel={handleCancelSelection}
                        onSelectAll={handleSelectAll}
                        onDownload={handleDownloadSelected}
                        onCopy={() => handleCopyMaterials()}
                        onMove={() => handleMoveMaterials()}
                        onDelete={() => handleDeleteMaterials()}
                    />
                )}

                {showFetchFromDriveForm && (
                    <FetchFromDriveForm
                        onClose={() => setShowFetchFromDriveForm(false)}
                        onSubmit={(url: string) => handleFetchFromDrive(url)}
                    />
                )}

                {formData.show && (
                    <MaterialForm
                        materialType={formData.type}
                        material={formData.material}
                        parentId={
                            currentPath.length > 0
                                ? (currentPath[currentPath.length - 1].id ??
                                  null)
                                : null
                        }
                        onClose={() =>
                            setFormData({
                                show: false,
                                type: null,
                                material: null,
                            })
                        }
                        onSubmit={handleFormSubmit}
                    />
                )}

                {floatingContainer.show && (
                    <FloatingContainer
                        operation={floatingContainer.operation}
                        materials={materials}
                        selectedMaterials={selectedMaterials}
                        currentPath={floatingContainer.targetPath}
                        folders={floatingFolders.filter((f) =>
                            floatingContainer.targetPath.length === 0
                                ? f.parent_id === null
                                : f.parent_id ===
                                  floatingContainer.targetPath[
                                      floatingContainer.targetPath.length - 1
                                  ].id,
                        )}
                        initialTargetId={
                            floatingContainer.targetPath.length > 0
                                ? floatingContainer.targetPath[
                                      floatingContainer.targetPath.length - 1
                                  ].id
                                : null
                        }
                        onClose={() =>
                            setFloatingContainer({
                                show: false,
                                operation: "copy",
                                targetPath: [],
                            })
                        }
                        onConfirm={handleFloatingConfirm}
                        onNavigate={handleFloatingNavigate}
                        onCreateFolder={handleCreateFolderInFloating}
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

                {draggedFilesState.active && (
                    <div
                        className={styles.draggedFilesIcon}
                        style={{
                            left: `${draggedFilesState.x}px`,
                            top: `${draggedFilesState.y}px`,
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            color="#5A0F61"
                        >
                            <path d="M15.5 9H8.5V7H15.5V9ZM15.5 11H8.5V13H15.5V11ZM8.5 15H12.5V17H8.5V15ZM7 21C6.45 21 5.979 20.804 5.587 20.412C5.195 20.02 4.99933 19.5493 5 19V5C5 4.45 5.196 3.979 5.588 3.587C5.98 3.195 6.45067 2.99933 7 3H14L19 8V19C19 19.55 18.804 20.021 18.412 20.413C18.02 20.805 17.5493 21.0007 17 21H7Z" />
                        </svg>
                        <div className={styles.draggedFilesCount}>
                            {selectedMaterials.length}
                        </div>
                    </div>
                )}

                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    onClose={() =>
                        setConfirmModal({ isOpen: false, action: null })
                    }
                    onConfirm={() => {
                        if (
                            confirmModal.action === "delete" ||
                            confirmModal.action === "bulkDelete"
                        ) {
                            confirmDelete();
                        } else if (confirmModal.action === "move") {
                            confirmMove(confirmModal.targetId ?? null);
                        }
                    }}
                    title={
                        confirmModal.action === "delete"
                            ? "Delete Material?"
                            : confirmModal.action === "bulkDelete"
                              ? "Delete Materials?"
                              : "Move Materials?"
                    }
                    message={
                        confirmModal.action === "delete"
                            ? "Are you sure you want to delete this material? This action cannot be undone."
                            : confirmModal.action === "bulkDelete"
                              ? `Are you sure you want to delete ${selectedMaterials.length} material${selectedMaterials.length > 1 ? "s" : ""}? This action cannot be undone.`
                              : `Are you sure you want to move ${selectedMaterials.length} material${selectedMaterials.length > 1 ? "s" : ""} to this location?`
                    }
                    confirmText={
                        confirmModal.action === "delete" ||
                        confirmModal.action === "bulkDelete"
                            ? "Delete"
                            : "Move"
                    }
                    colorType={
                        confirmModal.action === "delete" ||
                        confirmModal.action === "bulkDelete"
                            ? "red"
                            : "orange"
                    }
                    disabled={
                        (confirmModal.action === "delete" && isDeleting) ||
                        (confirmModal.action === "bulkDelete" && isDeleting) ||
                        (confirmModal.action === "move" && isMoving)
                    }
                />

                <DropZone
                    isVisible={dropZoneVisible}
                    onFilesSelected={handleDropZoneFilesSelected}
                    onClose={handleDropZoneClose}
                />

                {bulkUploadFiles && (
                    <BulkUploadModal
                        files={bulkUploadFiles}
                        onClose={handleBulkUploadClose}
                        onMaterialCreate={handleCreateMaterialFromUpload}
                    />
                )}
            </div>
        </Layout>
    );
}
