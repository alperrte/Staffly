import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    ChevronDown,
    ChevronUp,
    FileText,
    Search,
    XCircle,
} from "lucide-react";
import {
    createDepartment,
    getDepartments,
    updateDepartment,
} from "../../services/departmentService";

import type {
    Department,
    SubDepartment,
    DepartmentPosition,
} from "../../types/departmentTypes";

type DeptTab = "departments" | "passive";
type SortField = "name" | "description";
type SortDirection = "asc" | "desc";

function DepartmentManagementPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [expandedDepartmentIds, setExpandedDepartmentIds] = useState<number[]>([]);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<DeptTab>("departments");
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const emptyPosition: DepartmentPosition = {
        name: "",
        description: "",
    };

    const emptySubDepartment: SubDepartment = {
        name: "",
        description: "",
        managerId: null,
        positions: [{ ...emptyPosition }],
    };

    const emptyDepartmentForm: Department = {
        name: "",
        description: "",
        managerId: null,
        subDepartments: [{ ...emptySubDepartment }],
    };

    const [createForm, setCreateForm] = useState<Department>(emptyDepartmentForm);
    const [updateForm, setUpdateForm] = useState<Department>(emptyDepartmentForm);
    const [updateSelectedSubIndex, setUpdateSelectedSubIndex] = useState(0);
    const [updateSelectedPositionIndex, setUpdateSelectedPositionIndex] = useState(0);

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const data = await getDepartments();
            setDepartments(data);
        } catch (err) {
            console.error(err);
            alert("Departmanlar alınamadı");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await loadDepartments();
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!isUpdateOpen) return;
        if (updateForm.subDepartments.length === 0) {
            setUpdateSelectedSubIndex(0);
            return;
        }
        setUpdateSelectedSubIndex((i) =>
            Math.min(i, updateForm.subDepartments.length - 1)
        );
    }, [isUpdateOpen, updateForm.subDepartments.length]);

    const updateSelectedPositionsLength =
        updateForm.subDepartments[updateSelectedSubIndex]?.positions.length ?? 0;

    useEffect(() => {
        if (!isUpdateOpen) return;
        if (updateSelectedPositionsLength === 0) {
            setUpdateSelectedPositionIndex(0);
            return;
        }
        setUpdateSelectedPositionIndex((i) =>
            Math.min(i, updateSelectedPositionsLength - 1)
        );
    }, [isUpdateOpen, updateSelectedSubIndex, updateSelectedPositionsLength]);

    const toggleDepartmentExpand = (id: number) => {
        setExpandedDepartmentIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const resetCreateForm = () => {
        setCreateForm({
            name: "",
            description: "",
            managerId: null,
            subDepartments: [
                {
                    name: "",
                    description: "",
                    managerId: null,
                    positions: [{ name: "", description: "" }],
                },
            ],
        });
    };

    const mapDepartmentToForm = (dep: Department): Department => ({
        id: dep.id,
        name: dep.name,
        description: dep.description,
        managerId: dep.managerId ?? null,
        subDepartments:
            dep.subDepartments?.length > 0
                ? dep.subDepartments.map((sub) => ({
                    name: sub.name,
                    description: sub.description,
                    managerId: sub.managerId ?? null,
                    positions:
                        sub.positions?.length > 0
                            ? sub.positions.map((pos) => ({
                                name: pos.name,
                                description: pos.description,
                            }))
                            : [{ name: "", description: "" }],
                }))
                : [
                    {
                        name: "",
                        description: "",
                        managerId: null,
                        positions: [{ name: "", description: "" }],
                    },
                ],
    });

    const handleCreateChange = (field: keyof Department, value: string | number | null) => {
        setCreateForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleUpdateChange = (field: keyof Department, value: string | number | null) => {
        setUpdateForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreateSubDepartmentChange = (
        subIndex: number,
        field: keyof SubDepartment,
        value: string | number | null
    ) => {
        setCreateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                [field]: value,
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const handleUpdateSubDepartmentChange = (
        subIndex: number,
        field: keyof SubDepartment,
        value: string | number | null
    ) => {
        setUpdateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                [field]: value,
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const handleCreatePositionChange = (
        subIndex: number,
        posIndex: number,
        field: keyof DepartmentPosition,
        value: string
    ) => {
        setCreateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            const updatedPositions = [...updatedSubs[subIndex].positions];
            updatedPositions[posIndex] = {
                ...updatedPositions[posIndex],
                [field]: value,
            };
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: updatedPositions,
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const handleUpdatePositionChange = (
        subIndex: number,
        posIndex: number,
        field: keyof DepartmentPosition,
        value: string
    ) => {
        setUpdateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            const updatedPositions = [...updatedSubs[subIndex].positions];
            updatedPositions[posIndex] = {
                ...updatedPositions[posIndex],
                [field]: value,
            };
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: updatedPositions,
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const addCreateSubDepartment = () => {
        setCreateForm((prev) => ({
            ...prev,
            subDepartments: [
                ...prev.subDepartments,
                {
                    name: "",
                    description: "",
                    managerId: null,
                    positions: [{ name: "", description: "" }],
                },
            ],
        }));
    };


    const addCreatePosition = (subIndex: number) => {
        setCreateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: [...updatedSubs[subIndex].positions, { name: "", description: "" }],
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };



    const removeCreateSubDepartment = (subIndex: number) => {
        setCreateForm((prev) => ({
            ...prev,
            subDepartments: prev.subDepartments.filter((_, i) => i !== subIndex),
        }));
    };

    const removeUpdateSubDepartment = (subIndex: number) => {
        setUpdateForm((prev) => ({
            ...prev,
            subDepartments: prev.subDepartments.filter((_, i) => i !== subIndex),
        }));
    };

    const removeCreatePosition = (subIndex: number, posIndex: number) => {
        setCreateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: updatedSubs[subIndex].positions.filter((_, i) => i !== posIndex),
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const removeUpdatePosition = (subIndex: number, posIndex: number) => {
        setUpdateForm((prev) => {
            const updatedSubs = [...prev.subDepartments];
            updatedSubs[subIndex] = {
                ...updatedSubs[subIndex],
                positions: updatedSubs[subIndex].positions.filter((_, i) => i !== posIndex),
            };
            return { ...prev, subDepartments: updatedSubs };
        });
    };

    const sanitizeDepartmentPayload = (data: Department): Department => {
        return {
            ...data,
            name: data.name.trim(),
            description: data.description.trim(),
            subDepartments: data.subDepartments
                .filter((sub) => sub.name.trim() !== "")
                .map((sub) => ({
                    ...sub,
                    name: sub.name.trim(),
                    description: sub.description.trim(),
                    positions: sub.positions
                        .filter((pos) => pos.name.trim() !== "")
                        .map((pos) => ({
                            name: pos.name.trim(),
                            description: pos.description.trim(),
                        })),
                })),
        };
    };

    const handleCreate = async () => {
        try {
            const payload = sanitizeDepartmentPayload(createForm);
            await createDepartment(payload);
            alert("Departman oluşturuldu");
            setIsCreateOpen(false);
            resetCreateForm();
            await loadDepartments();
        } catch (err) {
            console.error(err);
            alert("Departman oluşturulamadı");
        }
    };

    const handleOpenUpdate = (dep: Department) => {
        setSelectedDepartmentId(dep.id!);
        setUpdateForm(mapDepartmentToForm(dep));
        setUpdateSelectedSubIndex(0);
        setUpdateSelectedPositionIndex(0);
        setIsUpdateOpen(true);
    };

    const handleAddUpdateSubDepartmentClick = () => {
        setUpdateForm((prev) => {
            const subDepartments = [
                ...prev.subDepartments,
                {
                    name: "",
                    description: "",
                    managerId: null,
                    positions: [{ name: "", description: "" }],
                },
            ];
            setUpdateSelectedSubIndex(subDepartments.length - 1);
            return { ...prev, subDepartments };
        });
    };

    const handleRemoveUpdateSubDepartmentClick = (subIndex: number) => {
        removeUpdateSubDepartment(subIndex);
        setUpdateSelectedSubIndex((prevSel) => {
            if (subIndex < prevSel) return prevSel - 1;
            if (subIndex === prevSel) return Math.max(0, prevSel - 1);
            return prevSel;
        });
        setUpdateSelectedPositionIndex(0);
    };

    const handleAddUpdatePositionClick = () => {
        const subIdx = updateSelectedSubIndex;
        setUpdateForm((prev) => {
            const subs = [...prev.subDepartments];
            const positions = [
                ...subs[subIdx].positions,
                { name: "", description: "" },
            ];
            subs[subIdx] = { ...subs[subIdx], positions };
            setUpdateSelectedPositionIndex(positions.length - 1);
            return { ...prev, subDepartments: subs };
        });
    };

    const handleRemoveUpdatePositionClick = (subIndex: number, posIndex: number) => {
        removeUpdatePosition(subIndex, posIndex);
        setUpdateSelectedPositionIndex((prevSel) => {
            if (posIndex < prevSel) return prevSel - 1;
            if (posIndex === prevSel) return Math.max(0, prevSel - 1);
            return prevSel;
        });
    };

    const handleToggleDepartment = async (dep: Department) => {
        try {
            await updateDepartment(dep.id!, {
                ...dep,
                deleted: !dep.deleted,
            });
            await loadDepartments();
        } catch (err) {
            console.error(err);
            alert("İşlem başarısız");
        }
    };

    const handleUpdate = async () => {
        if (!selectedDepartmentId) {
            alert("Lütfen düzenlenecek departmanı seç");
            return;
        }

        try {
            const payload = sanitizeDepartmentPayload(updateForm);
            await updateDepartment(selectedDepartmentId, payload);
            alert("Departman güncellendi");
            setIsUpdateOpen(false);
            await loadDepartments();
        } catch (err) {
            console.error(err);
            alert("Departman güncellenemedi");
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            return;
        }
        setSortField(field);
        setSortDirection("asc");
    };

    const counts = useMemo(() => {
        return {
            departments: departments.filter((d) => d.deleted !== true).length,
            passive: departments.filter((d) => d.deleted === true).length,
        };
    }, [departments]);

    const filteredDepartments = useMemo(() => {
        const lowerSearch = searchTerm.trim().toLowerCase();

        const filtered = departments.filter((dep) => {
            const matchesTab =
                (activeTab === "departments" && dep.deleted !== true) ||
                (activeTab === "passive" && dep.deleted === true);

            const matchesSearch =
                lowerSearch === "" ||
                dep.name.toLowerCase().includes(lowerSearch) ||
                dep.description.toLowerCase().includes(lowerSearch);

            return matchesTab && matchesSearch;
        });

        return filtered.sort((a, b) => {
            const aValue = (a[sortField] || "").toString().toLowerCase();
            const bValue = (b[sortField] || "").toString().toLowerCase();
            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [departments, activeTab, searchTerm, sortField, sortDirection]);

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ChevronDown className="h-4 w-4 text-slate-500" />;
        }
        return sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4 text-sky-400" />
        ) : (
            <ChevronDown className="h-4 w-4 text-sky-400" />
        );
    };

    const getTabIcon = (tab: DeptTab) => {
        if (tab === "departments") {
            return <Building2 className="h-4 w-4 text-sky-300" />;
        }
        return <XCircle className="h-4 w-4 text-rose-300" />;
    };

    const tabTitles: Record<DeptTab, string> = {
        departments: "Departmanlar",
        passive: "Pasif Departmanlar",
    };

    const showDepartmentActions = activeTab === "departments";
    const showPassiveActions = activeTab === "passive";

    return (
        <div className="min-h-screen bg-[#020617] px-3 py-5 text-white sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[92rem]">
                <div className="mb-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:p-5">
                    <div className="mb-4">
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
                            Departman Yönetimi
                        </h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Departmanları listeleyin, arayın; aktif kayıtları düzenleyin veya pasif
                            kayıtları tekrar açın.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <div>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Departman adı veya açıklama ile ara..."
                                    className="h-[58px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 transition-all duration-300 hover:border-sky-400/40 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(true)}
                                className="h-[58px] w-full rounded-2xl bg-sky-600 px-6 text-sm font-semibold text-white transition hover:bg-sky-500 lg:w-auto"
                            >
                                + Departman Ekle
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(["departments", "passive"] as DeptTab[]).map((tab) => {
                        const isActive = activeTab === tab;
                        const count =
                            tab === "departments" ? counts.departments : counts.passive;

                        return (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab);
                                    setExpandedDepartmentIds([]);
                                }}
                                className={`cursor-pointer rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                                    isActive
                                        ? "border-sky-500 bg-sky-500/10 shadow-[0_0_25px_rgba(14,165,233,0.12)]"
                                        : "border-slate-800 bg-slate-900/70 hover:scale-[1.02] hover:border-sky-400/40 hover:shadow-[0_0_25px_rgba(56,189,248,0.12)]"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        {getTabIcon(tab)}
                                        <span className="text-sm text-slate-200">{tabTitles[tab]}</span>
                                    </div>
                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white">
                                        {count}
                                    </span>
                                </div>

                            </button>
                        );
                    })}
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-[0_0_35px_rgba(2,6,23,0.55)]">
                    <div className="grid grid-cols-12 gap-3 border-b border-slate-800 bg-slate-900/70 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-300 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => handleSort("name")}
                            className="col-span-4 flex cursor-pointer items-center gap-1 text-left transition-colors hover:text-sky-300"
                        >
                            <Building2 className="h-3.5 w-3.5" />
                            Departman
                            {renderSortIcon("name")}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSort("description")}
                            className="col-span-4 flex cursor-pointer items-center gap-1 text-left transition-colors hover:text-sky-300"
                        >
                            Açıklama
                            {renderSortIcon("description")}
                        </button>
                        <div className="col-span-2 flex items-center">Durum</div>
                        <div className="col-span-2 text-right">
                            {showDepartmentActions || showPassiveActions ? "İşlemler" : ""}
                        </div>
                    </div>

                    <div>
                        {loading ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                Departmanlar yükleniyor...
                            </div>
                        ) : filteredDepartments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                                <FileText className="mb-4 h-14 w-14 opacity-30" />
                                <p className="text-sm text-slate-300">Henüz departman bulunmuyor</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Arama veya sekme kriterlerine uygun kayıt yok
                                </p>
                            </div>
                        ) : (
                            filteredDepartments.map((dep) => {
                                const isExpanded = expandedDepartmentIds.includes(dep.id!);
                                const isPassive = dep.deleted === true;

                                return (
                                    <div key={dep.id} className="border-b border-slate-800 last:border-b-0">
                                        <div
                                            className="grid grid-cols-12 gap-3 px-5 py-4 text-left transition-all duration-200 hover:bg-slate-900/50"
                                        >
                                            <div
                                                role="presentation"
                                                onClick={() => toggleDepartmentExpand(dep.id!)}
                                                className="col-span-4 flex cursor-pointer items-center gap-2 text-sm text-white"
                                            >
                                                <span className="truncate font-medium">{dep.name}</span>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                                                )}
                                            </div>
                                            <div
                                                role="presentation"
                                                onClick={() => toggleDepartmentExpand(dep.id!)}
                                                className="col-span-4 flex cursor-pointer items-center text-sm text-slate-300"
                                            >
                                                <span className="line-clamp-2">{dep.description || "—"}</span>
                                            </div>
                                            <div
                                                role="presentation"
                                                onClick={() => toggleDepartmentExpand(dep.id!)}
                                                className="col-span-2 flex items-center"
                                            >
                                                <span
                                                    className={`rounded-full border px-2.5 py-0.5 text-xs ${
                                                        isPassive
                                                            ? "border-rose-400/20 bg-rose-500/15 text-rose-300"
                                                            : "border-emerald-400/20 bg-emerald-500/15 text-emerald-300"
                                                    }`}
                                                >
                                                    {isPassive ? "Pasif" : "Aktif"}
                                                </span>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-end gap-2">
                                                {showDepartmentActions && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenUpdate(dep);
                                                            }}
                                                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                                                        >
                                                            Düzenle
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedDepartment(dep);
                                                                setConfirmModalOpen(true);
                                                            }}
                                                            className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500"
                                                        >
                                                            Kapat
                                                        </button>
                                                    </>
                                                )}
                                                {showPassiveActions && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenUpdate(dep);
                                                            }}
                                                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                                                        >
                                                            Düzenle
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedDepartment(dep);
                                                                setConfirmModalOpen(true);
                                                            }}
                                                            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
                                                        >
                                                            Aç
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="border-t border-slate-800 bg-slate-900/40 px-5 py-5">
                                                {dep.subDepartments && dep.subDepartments.length > 0 ? (
                                                    dep.subDepartments.map((sub, subIndex) => (
                                                        <div
                                                            key={subIndex}
                                                            className="mb-4 last:mb-0 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                                                        >
                                                            <div className="text-sm font-semibold text-sky-300">
                                                                ↳ {sub.name}
                                                            </div>
                                                            <div className="mt-1 text-sm text-slate-400">
                                                                {sub.description}
                                                            </div>
                                                            {sub.positions && sub.positions.length > 0 && (
                                                                <div className="mt-3 space-y-2 border-t border-slate-800 pt-3 pl-2">
                                                                    {sub.positions.map((pos, posIndex) => (
                                                                        <div
                                                                            key={posIndex}
                                                                            className="text-sm text-slate-300"
                                                                        >
                                                                            • <span className="font-medium">{pos.name}</span>{" "}
                                                                            <span className="text-slate-500">—</span>{" "}
                                                                            {pos.description}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-sm text-slate-500">
                                                        Alt departman bulunmuyor
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {isCreateOpen && (
                <ModalWrapper title="Yeni Departman" onClose={() => setIsCreateOpen(false)}>
                    <input
                        placeholder="Departman Adı"
                        value={createForm.name}
                        onChange={(e) => handleCreateChange("name", e.target.value)}
                        className={modalInputClass}
                    />
                    <input
                        placeholder="Departman Açıklama"
                        value={createForm.description}
                        onChange={(e) => handleCreateChange("description", e.target.value)}
                        className={modalInputClass}
                    />
                    {createForm.subDepartments.map((sub, subIndex) => (
                        <div key={subIndex} className={modalSubCardClass}>
                            <input
                                placeholder="Alt Departman Adı"
                                value={sub.name}
                                onChange={(e) =>
                                    handleCreateSubDepartmentChange(subIndex, "name", e.target.value)
                                }
                                className={modalInputClass}
                            />
                            <input
                                placeholder="Alt Departman Açıklama"
                                value={sub.description}
                                onChange={(e) =>
                                    handleCreateSubDepartmentChange(subIndex, "description", e.target.value)
                                }
                                className={modalInputClass}
                            />
                            {sub.positions.map((pos, posIndex) => (
                                <div key={posIndex} className="ml-3 space-y-2 border-l border-slate-700 pl-3">
                                    <input
                                        placeholder="Pozisyon Adı"
                                        value={pos.name}
                                        onChange={(e) =>
                                            handleCreatePositionChange(
                                                subIndex,
                                                posIndex,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        className={modalInputClass}
                                    />
                                    <input
                                        placeholder="Pozisyon Açıklama"
                                        value={pos.description}
                                        onChange={(e) =>
                                            handleCreatePositionChange(
                                                subIndex,
                                                posIndex,
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className={modalInputClass}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeCreatePosition(subIndex, posIndex)}
                                        className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs text-white hover:bg-rose-500"
                                    >
                                        Pozisyon Sil
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addCreatePosition(subIndex)}
                                className="mt-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500"
                            >
                                + Pozisyon Ekle
                            </button>
                            <button
                                type="button"
                                onClick={() => removeCreateSubDepartment(subIndex)}
                                className="ml-2 mt-2 rounded-lg bg-rose-700 px-3 py-2 text-sm text-white hover:bg-rose-600"
                            >
                                Alt Departman Sil
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addCreateSubDepartment}
                        className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                        + Alt Departman Ekle
                    </button>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="mt-4 w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500"
                    >
                        Oluştur
                    </button>
                </ModalWrapper>
            )}

            {isUpdateOpen && (
                <ModalWrapper
                    title="Departman Düzenle"
                    onClose={() => {
                        setIsUpdateOpen(false);
                        setUpdateSelectedSubIndex(0);
                        setUpdateSelectedPositionIndex(0);
                    }}
                >
                    <input
                        placeholder="Departman Adı"
                        value={updateForm.name}
                        onChange={(e) => handleUpdateChange("name", e.target.value)}
                        className={modalInputClass}
                    />
                    <input
                        placeholder="Departman Açıklama"
                        value={updateForm.description}
                        onChange={(e) => handleUpdateChange("description", e.target.value)}
                        className={modalInputClass}
                    />
                    <details className="mb-4 rounded-xl border border-slate-700 bg-slate-900/40 p-2">
                        <summary className="cursor-pointer select-none px-2 py-2 text-sm font-semibold text-white">
                            Alt Departmanlar
                        </summary>
                        <div className="mt-2 space-y-3 border-t border-slate-700 px-2 pt-3">
                            {updateForm.subDepartments.length > 0 ? (
                                <label className="block text-xs font-medium text-slate-400">
                                    Düzenlemek için alt departman seçin
                                    <select
                                        className={`${modalInputClass} mt-1`}
                                        value={updateSelectedSubIndex}
                                        onChange={(e) => {
                                            setUpdateSelectedSubIndex(Number(e.target.value));
                                            setUpdateSelectedPositionIndex(0);
                                        }}
                                    >
                                        {updateForm.subDepartments.map((sub, i) => (
                                            <option key={i} value={i}>
                                                {sub.name.trim() !== ""
                                                    ? sub.name
                                                    : `Alt Departman ${i + 1}`}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            ) : (
                                <p className="text-xs text-slate-500">
                                    Henüz alt departman yok. Aşağıdan yeni alt departman ekleyebilirsiniz.
                                </p>
                            )}
                            {updateForm.subDepartments[updateSelectedSubIndex] != null && (
                                <div
                                    key={updateSelectedSubIndex}
                                    className={modalSubCardClass}
                                >
                                    <input
                                        placeholder="Alt Departman Adı"
                                        value={
                                            updateForm.subDepartments[updateSelectedSubIndex].name
                                        }
                                        onChange={(e) =>
                                            handleUpdateSubDepartmentChange(
                                                updateSelectedSubIndex,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        className={modalInputClass}
                                    />
                                    <input
                                        placeholder="Alt Departman Açıklama"
                                        value={
                                            updateForm.subDepartments[updateSelectedSubIndex]
                                                .description
                                        }
                                        onChange={(e) =>
                                            handleUpdateSubDepartmentChange(
                                                updateSelectedSubIndex,
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className={modalInputClass}
                                    />
                                    <details className="ml-3 rounded-lg border border-slate-700 bg-slate-950/50 p-2">
                                        <summary className="cursor-pointer select-none px-1 py-1 text-xs font-semibold text-white">
                                            Pozisyonlar
                                        </summary>
                                        <div className="mt-2 space-y-3 border-t border-slate-700 pt-3 pl-2">
                                            {updateForm.subDepartments[updateSelectedSubIndex].positions
                                                .length > 0 ? (
                                                <>
                                                    <label className="block text-xs font-medium text-slate-400">
                                                        Düzenlemek için pozisyon seçin
                                                        <select
                                                            className={`${modalInputClass} mt-1`}
                                                            value={updateSelectedPositionIndex}
                                                            onChange={(e) =>
                                                                setUpdateSelectedPositionIndex(
                                                                    Number(e.target.value)
                                                                )
                                                            }
                                                        >
                                                            {updateForm.subDepartments[
                                                                updateSelectedSubIndex
                                                                ].positions.map((pos, i) => (
                                                                <option key={i} value={i}>
                                                                    {pos.name.trim() !== ""
                                                                        ? pos.name
                                                                        : `Pozisyon ${i + 1}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </label>
                                                    {updateForm.subDepartments[
                                                        updateSelectedSubIndex
                                                        ].positions[updateSelectedPositionIndex] != null && (
                                                        <div
                                                            key={updateSelectedPositionIndex}
                                                            className="space-y-2 border-l border-slate-700 pl-3"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    placeholder="Pozisyon Adı"
                                                                    value={
                                                                        updateForm.subDepartments[
                                                                            updateSelectedSubIndex
                                                                            ].positions[updateSelectedPositionIndex]
                                                                            .name
                                                                    }
                                                                    onChange={(e) =>
                                                                        handleUpdatePositionChange(
                                                                            updateSelectedSubIndex,
                                                                            updateSelectedPositionIndex,
                                                                            "name",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className={`${modalInputClass.replace("mb-3", "mb-0")} min-w-0 flex-1`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveUpdatePositionClick(
                                                                            updateSelectedSubIndex,
                                                                            updateSelectedPositionIndex
                                                                        )
                                                                    }
                                                                    className="shrink-0 rounded-lg bg-rose-600 px-3 py-2 text-xs text-white hover:bg-rose-500"
                                                                >
                                                                    Pozisyon Sil
                                                                </button>
                                                            </div>
                                                            <input
                                                                placeholder="Pozisyon Açıklama"
                                                                value={
                                                                    updateForm.subDepartments[
                                                                        updateSelectedSubIndex
                                                                        ].positions[updateSelectedPositionIndex]
                                                                        .description
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdatePositionChange(
                                                                        updateSelectedSubIndex,
                                                                        updateSelectedPositionIndex,
                                                                        "description",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className={modalInputClass}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-xs text-slate-500">
                                                    Henüz pozisyon yok. Aşağıdan pozisyon ekleyebilirsiniz.
                                                </p>
                                            )}
                                            <button
                                                type="button"
                                                onClick={handleAddUpdatePositionClick}
                                                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500"
                                            >
                                                + Pozisyon Ekle
                                            </button>
                                        </div>
                                    </details>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveUpdateSubDepartmentClick(
                                                updateSelectedSubIndex
                                            )
                                        }
                                        className="ml-2 mt-2 rounded-lg bg-rose-700 px-3 py-2 text-sm text-white hover:bg-rose-600"
                                    >
                                        Alt Departman Sil
                                    </button>
                                </div>
                            )}
                        </div>
                    </details>
                    <button
                        type="button"
                        onClick={handleAddUpdateSubDepartmentClick}
                        className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                    >
                        + Alt Departman Ekle
                    </button>
                    <button
                        type="button"
                        onClick={handleUpdate}
                        className="mt-4 w-full rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500"
                    >
                        Güncelle
                    </button>
                </ModalWrapper>
            )}

            {confirmModalOpen && selectedDepartment && (
                <ModalWrapper
                    title="Onay"
                    onClose={() => {
                        setConfirmModalOpen(false);
                        setSelectedDepartment(null);
                    }}
                >
                    <p className="mb-6 text-sm leading-6 text-slate-300">
                        {selectedDepartment.deleted
                            ? "Departmanı açmak istediğinize emin misiniz?"
                            : "Departmanı kapatmak istediğinize emin misiniz?"}
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={async () => {
                                await handleToggleDepartment(selectedDepartment);
                                setConfirmModalOpen(false);
                                setSelectedDepartment(null);
                            }}
                            className="flex-1 rounded-xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500"
                        >
                            Evet
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setConfirmModalOpen(false);
                                setSelectedDepartment(null);
                            }}
                            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Hayır
                        </button>
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
}

function ModalWrapper({
                          title,
                          children,
                          onClose,
                      }: {
    title: string;
    children: React.ReactNode;
    onClose?: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-8 shadow-[0_0_50px_rgba(2,6,23,0.8)]">
                <div className="mb-6 flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                            Kapat
                        </button>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}

const modalInputClass =
    "mb-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

const modalSubCardClass =
    "mb-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 last:mb-0";

export default DepartmentManagementPage;
