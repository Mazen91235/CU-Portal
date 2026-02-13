import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useLazySearchFacultiesQuery } from "../../../services/apis/admin/FacultyAPIs";
import { useLazySearchDepartmentsQuery } from "../../../services/apis/admin/DepartmentAPIs";
import { useLazySearchYearsQuery } from "../../../services/apis/admin/YearAPIs";
import { useLazySearchCoursesQuery } from "../../../services/apis/admin/CourseAPIs";
import {
    useLazyGetMaterialsQuery,
    useLazyGetMaterialParentsQuery,
    useCreateMaterialMutation,
    useUpdateMaterialMutation,
    useDeleteMaterialMutation,
    useCopyMaterialsMutation,
    useMoveMaterialsMutation,
    useLazyGetMaterialsFromDriveQuery,
} from "../../../services/apis/admin/MaterialAPIs";
import type { Material } from "../../../types/entities/Material";
import type { Faculty } from "../../../types/entities/Faculty";
import type { Department } from "../../../types/entities/Department";
import type { Year } from "../../../types/entities/Year";
import type { Subject } from "../../../types/entities/Subject";
import { showToast } from "../../../utils/ToastsManager";
import { handlePopupErrors } from "../../../utils/ErrorHandling";
import { downloadFile } from "../../../utils/FileDownloader";
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

import emptySectionIcon from "../../../assets/icons/materials-welcome.svg";
import folderEmptyIcon from "../../../assets/icons/folder-empty.jpg";
import { Banner } from "../../../components/banner/Banner";
import type { Process } from "../../../types/Process";
import { setProcess } from "../../../services/redux/reducers/ProcessReducer";
import { useSearchParams } from "react-router";
import type {
    DefaultAPIResponse,
    GenericAPIResponse,
} from "../../../types/responses/GenericAPIResponse";
import { useCreateProcess } from "../../../hooks/useHandleProcesses";
import styles from "./MaterialsPage.module.css";
import { copyToClipboard } from "../../../utils/ClipboardHandler";

export function MaterialsPage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.user);
    const [searchParams, setSearchParams] = useSearchParams();
    const [materialFromUrl, setMaterialFromUrl] = useState<{
        id?: number;
        subject_id?: number;
        parent_id?: number | null;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [facultyFilter, setFacultyFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("");
    const [draggedFilesState, setDraggedFilesState] = useState({
        active: false,
        x: 0,
        y: 0,
    });

    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [years, setYears] = useState<Year[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [currentPath, setCurrentPath] = useState<Material[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [floatingFolders, setFloatingFolders] = useState<Material[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [formData, setFormData] = useState<{
        show: boolean;
        type: "folder" | "file" | "drive" | "youtube" | "external" | null;
        material: Material | null;
    }>({ show: false, type: null, material: null });
    const [showFetchFromDriveForm, setShowFetchFromDriveForm] = useState(false);
    const [floatingContainer, setFloatingContainer] = useState<{
        show: boolean;
        operation: "copy" | "move";
        targetPath: Material[];
    }>({ show: false, operation: "copy", targetPath: [] });
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
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        action: "delete" | "bulkDelete" | "move" | null;
        targetId?: number | null;
        materialId?: number;
    }>({ isOpen: false, action: null });
    const [dropZoneVisible, setDropZoneVisible] = useState(false);
    const [bulkUploadFiles, setBulkUploadFiles] = useState<File[] | null>(null);
    const [isDraggingExternal, setIsDraggingExternal] = useState(false);

    const [searchFaculties] = useLazySearchFacultiesQuery();
    const [searchDepartments] = useLazySearchDepartmentsQuery();
    const [searchYears] = useLazySearchYearsQuery();
    const [searchCourses] = useLazySearchCoursesQuery();
    const [getMaterials] = useLazyGetMaterialsQuery();
    const [getMaterialParents] = useLazyGetMaterialParentsQuery();
    const [createMaterial] = useCreateMaterialMutation();
    const [updateMaterial] = useUpdateMaterialMutation();
    const [deleteMaterial, { isLoading: isDeleting }] =
        useDeleteMaterialMutation();
    const [copyMaterials] = useCopyMaterialsMutation();
    const [moveMaterials, { isLoading: isMoving }] = useMoveMaterialsMutation();
    const [getMaterialsFromDrive] = useLazyGetMaterialsFromDriveQuery();
    const createProcess = useCreateProcess({});

    const fetchFaculties = useCallback(async () => {
        try {
            const result = await searchFaculties({}).unwrap();
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
                faculty_id: parseInt(facultyFilter) || undefined,
                study_type: "",
            }).unwrap();
            setDepartments(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchDepartments, facultyFilter]);

    const fetchYears = useCallback(async () => {
        try {
            const result = await searchYears({}).unwrap();
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
                params.faculty_id = user.faculty?.id;
                setFacultyFilter(user.faculty?.id?.toString() || "");
                params.department_id = user.department?.id;
                setDepartmentFilter(user.department?.id?.toString() || "");
                params.year_id = user.year?.id;
                setYearFilter(user.year?.id?.toString() || "");
            }

            if (Object.keys(params).length < 3) {
                setSubjects([]);
                return;
            }

            const result = await searchCourses(params).unwrap();
            setSubjects(result.data || []);
        } catch (error) {
            handlePopupErrors(error);
        }
    }, [searchCourses, facultyFilter, departmentFilter, yearFilter, user]);

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

    const fetchFolders = useCallback(
        async (parentId?: number | null) => {
            if (!subjectFilter) return;

            try {
                const response = await getMaterials({
                    type: "folder",
                    subject_id: parseInt(subjectFilter),
                    parent_id: parentId ?? undefined,
                }).unwrap();
                setFloatingFolders(response.data || []);
            } catch (error) {
                handlePopupErrors(error);
            }
        },
        [subjectFilter, getMaterials],
    );

    useEffect(() => {
        setCurrentPath([]);
        setSelectedMaterials([]);
        setIsSelectionMode(false);
    }, [facultyFilter, departmentFilter, yearFilter, subjectFilter]);

    const handleNavigate = useCallback(
        async (material: Material | null) => {
            if (material === null) {
                setCurrentPath([]);
            } else {
                if (!material.id) {
                    showToast("error", "Error", "Invalid material");
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
            setSelectedMaterials([]);
            setIsSelectionMode(false);
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
                fetchFaculties(),
                fetchDepartments(),
                fetchYears(),
                fetchSubjects(),
                fetchMaterials(),
                fetchFolders(),
                handleMatrialFromUrl(),
            ]),
        [
            fetchFaculties,
            fetchDepartments,
            fetchYears,
            fetchSubjects,
            fetchMaterials,
            fetchFolders,
            handleMatrialFromUrl,
        ],
    );

    useAuthQuery(authQueryParams);

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

    const handleCardDoubleClick = (material: Material) => {
        if (material.type === "folder") {
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
                        destination_id: targetId ?? undefined,
                    }).unwrap();
                    dispatch(setProcess({ ...process, status: "completed" }));
                    setCurrentPath((prev) => {
                        const latestParentId =
                            prev.length > 0 ? prev[prev.length - 1].id : null;
                        fetchMaterials(latestParentId);
                        return prev;
                    });
                } catch (error) {
                    const res =
                        (error as Error).message ||
                        (error as DefaultAPIResponse)?.data?.message ||
                        "Move failed";
                    dispatch(
                        setProcess({
                            ...process,
                            status: "failed",
                            reason: res,
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

    const handleEditMaterial = (material: Material) => {
        const materialType = material.type as
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
            for (const materialId of materialIds) {
                await deleteMaterial({ material_id: materialId }).unwrap();
            }
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
                let result: GenericAPIResponse<Material>;
                if (material && material.id) {
                    result = await updateMaterial({
                        material_id: material.id,
                        subject_id: parseInt(subjectFilter),
                        ...Object.fromEntries(data),
                    }).unwrap();
                } else {
                    result = await createMaterial({
                        subject_id: parseInt(subjectFilter),
                        ...Object.fromEntries(data),
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
                    const url = `/admin/materials?material_id=${result.data?.id}&subject_id=${subjectFilter}&parent_id=${currentPath[currentPath.length - 1]?.id ?? ""}`;
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

    const handleShareMaterials = (materialId?: number, type?: string) => {
        let url =
            window.location.origin +
            "/admin/materials?subject_id=" +
            subjectFilter;
        const parentId =
            currentPath.length > 0
                ? currentPath[currentPath.length - 1].id
                : null;
        if (type === "folder") {
            url += "&parent_id=" + materialId;
        } else {
            url += `&parent_id=${parentId}&material_id=${materialId}`;
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
                            destination_id: targetId ?? undefined,
                        }).unwrap();
                    } else {
                        await moveMaterials({
                            material_ids: selectedMaterials,
                            destination_id: targetId ?? undefined,
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
                    const res =
                        (error as Error).message ||
                        (error as DefaultAPIResponse)?.data?.message ||
                        "Operation failed";
                    dispatch(
                        setProcess({
                            ...process,
                            status: "failed",
                            reason: res,
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
                type: "folder",
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
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (materialFromUrl && materialFromUrl.id && materials.length > 0) {
            const material = materials.find((m) => m.id === materialFromUrl.id);
            if (material) {
                handlePreview(
                    material.details?.file_data?.id || "",
                    material.name || "Preview",
                );
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

    useEffect(() => {
        if (shouldDownload && downloadLink.current) {
            downloadLink.current.click();
            setShouldDownload(false);
        }
    }, [shouldDownload]);

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
                type: "file",
                subject_id: parseInt(subjectFilter),
                parent_id: parentId ?? undefined,
                url: uploadResult.url,
            }).unwrap();

            const url = `/admin/materials?material_id=${result.data?.id}&subject_id=${subjectFilter}&parent_id=${currentPath[currentPath.length - 1]?.id ?? ""}`;

            dispatch(setProcess({ ...uploadResult, status: "completed", url }));
            setCurrentPath((prev) => {
                const latestParentId =
                    (prev.length > 0 ? prev[prev.length - 1] : null)?.id ??
                    null;
                fetchMaterials(latestParentId);
                return prev;
            });
        },
        [createMaterial, dispatch, fetchMaterials, subjectFilter, currentPath],
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
                        drive_url: url,
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
                    const res =
                        (error as Error).message ||
                        (error as DefaultAPIResponse)?.data?.message ||
                        "Fetch failed";
                    dispatch(
                        setProcess({
                            ...process,
                            status: "failed",
                            reason: res,
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
                                setValue={setFacultyFilter}
                                value={facultyFilter}
                            />
                            <SelectFilter
                                options={departmentOptions}
                                setValue={setDepartmentFilter}
                                value={departmentFilter}
                            />
                            <SelectFilter
                                options={yearOptions}
                                setValue={setYearFilter}
                                value={yearFilter}
                            />
                        </>
                    )}
                    <SelectFilter
                        options={subjectOptions}
                        setValue={setSubjectFilter}
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
                        {isSelectionMode && selectedMaterials.length > 0 && (
                            <div className={styles.selectionBtns}>
                                <span className={styles.selectedCount}>
                                    {selectedMaterials.length} item
                                    {selectedMaterials.length > 1
                                        ? "s"
                                        : ""}{" "}
                                    selected
                                </span>
                                <button
                                    className={`${styles.selectionBtn} ${styles.copyBtn}`}
                                    onClick={handleSelectAll}
                                >
                                    <i className="fa-regular fa-circle-check me-2"></i>
                                    Select All
                                </button>
                                <button
                                    className={`${styles.selectionBtn} ${styles.copyBtn}`}
                                    onClick={() => handleCopyMaterials()}
                                >
                                    <i className="fa fa-link me-2"></i>
                                    Copy to
                                </button>
                                <button
                                    className={`${styles.selectionBtn} ${styles.moveBtn}`}
                                    onClick={() => handleMoveMaterials()}
                                >
                                    <i className="fa fa-folder me-2"></i>
                                    Move to
                                </button>
                                <button
                                    className={`${styles.selectionBtn} ${styles.deleteBtn}`}
                                    onClick={() => handleDeleteMaterials()}
                                >
                                    <i className="fa fa-trash me-2"></i>
                                    Delete
                                </button>
                                <button
                                    className={`${styles.selectionBtn} ${styles.cancelBtn}`}
                                    onClick={handleCancelSelection}
                                >
                                    <i className="fa fa-times me-2"></i>
                                    Cancel
                                </button>
                            </div>
                        )}

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
                                                    folder.type,
                                                );
                                            }}
                                            onPreview={handlePreview}
                                            onDownload={handleDownload}
                                            onOpenLink={handleOpenLink}
                                            isDraggingGlobal={
                                                draggedFilesState.active
                                            }
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
                                                    file.type,
                                                );
                                            }}
                                            onPreview={handlePreview}
                                            onDownload={handleDownload}
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

                {showFetchFromDriveForm && (
                    <FetchFromDriveForm
                        onClose={() => setShowFetchFromDriveForm(false)}
                        onSubmit={(url: string) => handleFetchFromDrive(url)}
                    />
                )}

                {formData.show && formData.type !== "drive" && (
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
                        onDownload={() =>
                            handleDownload(previewFile.id, previewFile.name)
                        }
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

                <a
                    href={fileToDownload?.url}
                    className="d-none"
                    download={fileToDownload?.name || "download"}
                    ref={downloadLink}
                />

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
