import { useEffect, useMemo, useState } from "react";
import {
    Building2,
    ChevronDown,
    ChevronUp,
    FileText,
    Search,
    XCircle,
} from "lucide-react";
import { getDepartments } from "../../services/departmentService";
import type { Department } from "../../types/departmentTypes";

type DeptTab = "departments" | "passive";
type SortField = "name" | "description";
type SortDirection = "asc" | "desc";

function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [expandedDepartmentIds, setExpandedDepartmentIds] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<DeptTab>("departments");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
        loadDepartments();
    }, []);

    const toggleDepartmentExpand = (id: number) => {
        setExpandedDepartmentIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
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
            return <ChevronDown className="h-4 w-4 text-slate-500"/>;
        }

        return sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4 text-sky-400"/>
        ) : (
            <ChevronDown className="h-4 w-4 text-sky-400"/>
        );
    };

    const getTabIcon = (tab: DeptTab) => {
        if (tab === "departments") {
            return <Building2 className="h-4 w-4 text-sky-300"/>;
        }

        return <XCircle className="h-4 w-4 text-rose-300"/>;
    };

    const tabTitles: Record<DeptTab, string> = {
        departments: "Departmanlar",
        passive: "Pasif Departmanlar",
    };

    return (
        <div className="min-h-screen bg-[#020617] px-3 py-5 text-white sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[92rem]">
                <div className="mb-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:p-5">
                    <div className="mb-4">
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
                            Departmanlar
                        </h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Departmanları, alt departmanları ve pozisyonları görüntüleyin.
                        </p>
                    </div>

                    <div className="relative">
                        <Search
                            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Departman adı veya açıklama ile ara..."
                            className="h-[58px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 transition-all duration-300 hover:border-sky-400/40 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                    </div>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(["departments", "passive"] as DeptTab[]).map((tab) => {
                        const isActive = activeTab === tab;
                        const count = tab === "departments" ? counts.departments : counts.passive;

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
                                        <span className="text-sm text-slate-200">
                                        {tabTitles[tab]}
                                    </span>
                                    </div>
                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white">
                                    {count}
                                </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div
                    className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-[0_0_35px_rgba(2,6,23,0.55)]">
                    <div
                        className="grid grid-cols-12 gap-3 border-b border-slate-800 bg-slate-900/70 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-300 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => handleSort("name")}
                            className="col-span-4 flex cursor-pointer items-center gap-1 text-left transition-colors hover:text-sky-300"
                        >
                            <Building2 className="h-3.5 w-3.5"/>
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

                        <div className="col-span-4 flex items-center">Durum</div>
                    </div>

                    <div>
                        {loading ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                Departmanlar yükleniyor...
                            </div>
                        ) : filteredDepartments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                                <FileText className="mb-4 h-14 w-14 opacity-30"/>
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
                                            className="grid grid-cols-12 gap-3 px-5 py-4 text-left transition-all duration-200 hover:bg-slate-900/50">
                                            <div
                                                role="presentation"
                                                onClick={() => toggleDepartmentExpand(dep.id!)}
                                                className="col-span-4 flex cursor-pointer items-center gap-2 text-sm text-white"
                                            >
                                                <span className="truncate font-medium">{dep.name}</span>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 shrink-0 text-slate-500"/>
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500"/>
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
                                                className="col-span-4 flex cursor-pointer items-center"
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
                                                                {sub.description || "Açıklama bulunmuyor"}
                                                            </div>

                                                            {sub.positions && sub.positions.length > 0 && (
                                                                <div
                                                                    className="mt-3 space-y-2 border-t border-slate-800 pt-3 pl-2">
                                                                    {sub.positions.map((pos, posIndex) => (
                                                                        <div
                                                                            key={posIndex}
                                                                            className="text-sm text-slate-300"
                                                                        >
                                                                            •{" "}
                                                                            <span className="font-medium">
                                                                            {pos.name}
                                                                        </span>{" "}
                                                                            <span
                                                                                className="text-slate-500">—</span>{" "}
                                                                            {pos.description || "Açıklama yok"}
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
        </div>
    );
}
export default DepartmentsPage;
