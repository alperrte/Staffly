import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDashed,
    BriefcaseBusiness,
    Building2,
    FileText,
    Search,
    X,
    XCircle,
    Clock3,
    User,
    Users,
    Layers3,
} from "lucide-react";

interface Application {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;

    departmentId: number;
    subDepartmentId: number;
    positionId: number;

    departmentName: string;
    subDepartmentName: string;
    positionName: string;

    status: string;
    appliedAt?: string;
    reviewedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

type TabType = "PENDING" | "ACCEPTED" | "REJECTED";
type SortField = "firstName" | "lastName" | "departmentName" | "positionName";
type SortDirection = "asc" | "desc";
type ActionType = "ACCEPTED" | "REJECTED" | null;

const statusMap: Record<string, string> = {
    PENDING: "Beklemede",
    ACCEPTED: "Onaylandı",
    REJECTED: "Reddedildi",
};

const tabTitles: Record<TabType, string> = {
    PENDING: "Aktif Başvurular",
    ACCEPTED: "Onaylanan Başvurular",
    REJECTED: "Reddedilen Başvurular",
};

const statusBadgeClasses: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-300 border border-amber-400/20",
    ACCEPTED: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20",
    REJECTED: "bg-rose-500/15 text-rose-300 border border-rose-400/20",
};

const formatDate = (date?: string) => {
    if (!date) return "-";

    const fixed = date.includes("Z") ? date : date + "Z";

    return new Date(fixed).toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

function ConfirmModal({
                          open,
                          title,
                          message,
                          confirmText,
                          confirmClassName,
                          loading,
                          onClose,
                          onConfirm,
                      }: {
    open: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmClassName: string;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-[0_0_50px_rgba(2,6,23,0.8)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                    >
                        Vazgeç
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${confirmClassName}`}
                    >
                        {loading ? "İşleniyor..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

const CvServicePage = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("PENDING");
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [sortField, setSortField] = useState<SortField>("firstName");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [loading, setLoading] = useState(false);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [pageError, setPageError] = useState("");
    const [showAllApplications, setShowAllApplications] = useState(false);
    const [cvModalOpen, setCvModalOpen] = useState(false);
    const [cvUrl, setCvUrl] = useState<string | null>(null);
    const [cvLoading, setCvLoading] = useState(false);
    const [cvFileName, setCvFileName] = useState("");
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        applicationId: number | null;
        action: ActionType;
    }>({
        open: false,
        applicationId: null,
        action: null,
    });

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setPageError("");
            const res = await api.get("http://localhost:8085/applications");
            setApplications(res.data);
        } catch (error) {
            console.error("Başvurular alınamadı:", error);
            setPageError("Başvurular yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const openCv = async (id: number, applicantName: string) => {
        try {
            setCvLoading(true);
            setPageError("");

            const token = localStorage.getItem("token");

            const response = await fetch(`http://localhost:8085/applications/${id}/cv`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("CV alınamadı");
            }

            const blob = await response.blob();
            const fileUrl = window.URL.createObjectURL(blob);

            setCvUrl(fileUrl);
            setCvFileName(`${applicantName}-cv.pdf`);
            setCvModalOpen(true);
        } catch (error) {
            console.error("CV açma hatası:", error);
            setPageError("CV açılırken bir hata oluştu.");
        } finally {
            setCvLoading(false);
        }
    };

    const closeCvModal = () => {
        if (cvUrl) {
            URL.revokeObjectURL(cvUrl);
        }

        setCvModalOpen(false);
        setCvUrl(null);
        setCvFileName("");
    };

    const openStatusModal = (id: number, action: "ACCEPTED" | "REJECTED") => {
        setConfirmModal({
            open: true,
            applicationId: id,
            action,
        });
    };

    const closeStatusModal = () => {
        setConfirmModal({
            open: false,
            applicationId: null,
            action: null,
        });
    };

    const updateStatus = async () => {
        if (!confirmModal.applicationId || !confirmModal.action) return;

        try {
            setActionLoadingId(confirmModal.applicationId);

            await api.patch(
                `http://localhost:8085/applications/${confirmModal.applicationId}/status?status=${confirmModal.action}`
            );

            closeStatusModal();
            await fetchApplications();
            setExpandedId(null);
        } catch (error) {
            console.error("Durum güncellenemedi:", error);
            setPageError("Başvuru durumu güncellenirken bir hata oluştu.");
        } finally {
            setActionLoadingId(null);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            return;
        }

        setSortField(field);
        setSortDirection("asc");
    };

    const filteredApplications = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const filtered = applications.filter((app) => {
            const matchesTab = showAllApplications ? true : app.status === activeTab;

            const matchesSearch =
                `${app.firstName} ${app.lastName}`.toLowerCase().includes(normalizedSearch) ||
                app.departmentName.toLowerCase().includes(normalizedSearch) ||
                app.subDepartmentName.toLowerCase().includes(normalizedSearch) ||
                app.positionName.toLowerCase().includes(normalizedSearch) ||
                app.email.toLowerCase().includes(normalizedSearch) ||
                (app.phone || "").toLowerCase().includes(normalizedSearch);

            return matchesTab && matchesSearch;
        });

        return filtered.sort((a, b) => {
            const aValue = (a[sortField] || "").toString().toLowerCase();
            const bValue = (b[sortField] || "").toString().toLowerCase();

            if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
            if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
    }, [
        applications,
        activeTab,
        searchTerm,
        sortField,
        sortDirection,
        showAllApplications,
    ]);

    const counts = useMemo(() => {
        return {
            PENDING: applications.filter((app) => app.status === "PENDING").length,
            ACCEPTED: applications.filter((app) => app.status === "ACCEPTED").length,
            REJECTED: applications.filter((app) => app.status === "REJECTED").length,
        };
    }, [applications]);

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

    const getLockedMessage = (status: string) => {
        if (status === "ACCEPTED") {
            return "Bu başvuru onaylanmıştır.";
        }

        if (status === "REJECTED") {
            return "Bu başvuru reddedilmiştir.";
        }

        return "Bu başvuru için işlem yapılabilir.";
    };

    const getTabIcon = (tab: TabType) => {
        if (tab === "PENDING") {
            return <Clock3 className="h-4 w-4 text-amber-300" />;
        }

        if (tab === "ACCEPTED") {
            return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
        }

        return <XCircle className="h-4 w-4 text-rose-300" />;
    };

    return (
        <div className="min-h-screen bg-[#020617] px-3 py-5 text-white sm:px-6 lg:px-8">
            <ConfirmModal
                open={confirmModal.open}
                title={
                    confirmModal.action === "ACCEPTED"
                        ? "Başvuruyu Onayla"
                        : "Başvuruyu Reddet"
                }
                message={
                    confirmModal.action === "ACCEPTED"
                        ? "Bu başvuruyu onaylamak istediğinize emin misiniz? Onaylanan başvuru onaylanan başvurular alanına taşınacaktır."
                        : "Bu başvuruyu reddetmek istediğinize emin misiniz? Reddedilen başvuru reddedilen başvurular alanına taşınacaktır."
                }
                confirmText={confirmModal.action === "ACCEPTED" ? "Onayla" : "Reddet"}
                confirmClassName={
                    confirmModal.action === "ACCEPTED"
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : "bg-rose-600 hover:bg-rose-500"
                }
                loading={actionLoadingId === confirmModal.applicationId}
                onClose={closeStatusModal}
                onConfirm={updateStatus}
            />

            {cvModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
                    <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_50px_rgba(2,6,23,0.85)]">
                        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">CV Önizleme</h3>
                                <p className="mt-1 text-sm text-slate-400">
                                    {cvFileName || "CV Dosyası"}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {cvUrl && (
                                    <a
                                        href={cvUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                                    >
                                        Yeni Sekmede Aç
                                    </a>
                                )}

                                {cvUrl && (
                                    <a
                                        href={cvUrl}
                                        download={cvFileName || "cv.pdf"}
                                        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500"
                                    >
                                        İndir
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={closeCvModal}
                                    className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-900/40 p-4">
                            {cvLoading ? (
                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                    CV yükleniyor...
                                </div>
                            ) : cvUrl ? (
                                <iframe
                                    src={cvUrl}
                                    title="CV Preview"
                                    className="h-full w-full rounded-2xl border border-slate-800 bg-white"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                                    CV görüntülenemedi.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mx-auto w-full max-w-[92rem]">
                <div className="mb-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 sm:p-5">
                    <div className="mb-4">
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
                            Başvurular
                        </h1>
                        <p className="mt-1 text-sm text-slate-300">
                            Başvuruları durumlarına göre yönetin, arayın ve detaylarını inceleyin.
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
                                    placeholder="Ad, soyad, departman, pozisyon, mail ile ara..."
                                    className="h-[58px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 transition-all duration-300 hover:border-sky-400/40 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="group flex h-[58px] cursor-pointer items-center rounded-2xl border border-slate-800 bg-slate-900/60 px-4 text-sm text-slate-200 transition-all duration-300 hover:border-sky-400/30 hover:bg-slate-900/80">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <input
                                        type="checkbox"
                                        checked={showAllApplications}
                                        onChange={(e) => setShowAllApplications(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-emerald-500"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-white">
                                            Tüm başvuruları göster
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            Sekmelere bakmadan tüm kayıtları tek listede gösterir
                                        </span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    {(["PENDING", "ACCEPTED", "REJECTED"] as TabType[]).map((tab) => {
                        const isActive = activeTab === tab;

                        return (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                    setActiveTab(tab);
                                    setExpandedId(null);
                                }}
                                className={`cursor-pointer rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                                    isActive
                                        ? "border-sky-500 bg-sky-500/10 shadow-[0_0_25px_rgba(14,165,233,0.12)]"
                                        : "border-slate-800 bg-slate-900/70 hover:border-sky-400/40 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(56,189,248,0.12)]"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        {getTabIcon(tab)}
                                        <span className="text-sm text-slate-200">{tabTitles[tab]}</span>
                                    </div>

                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white">
                                        {counts[tab]}
                                    </span>
                                </div>

                                <p className="mt-2 text-xs text-slate-400">
                                    {tab === "PENDING" &&
                                        "Bekleyen ve işlem yapılabilir başvurular burada listelenir."}
                                    {tab === "ACCEPTED" &&
                                        "Onaylanan başvurular bu alanda arşivlenir."}
                                    {tab === "REJECTED" &&
                                        "Reddedilen başvurular bu alanda görüntülenir."}
                                </p>
                            </button>
                        );
                    })}
                </div>

                {pageError && (
                    <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        {pageError}
                    </div>
                )}

                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-[0_0_35px_rgba(2,6,23,0.55)]">
                    <div className="grid grid-cols-12 gap-3 border-b border-slate-800 bg-slate-900/70 px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-300 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => handleSort("firstName")}
                            className="col-span-3 flex cursor-pointer items-center gap-1 text-left transition-colors hover:text-sky-300"
                        >
                            <User className="h-3.5 w-3.5" />
                            Ad
                            {renderSortIcon("firstName")}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSort("lastName")}
                            className="col-span-3 flex cursor-pointer items-center gap-1 text-left transition-colors hover:text-sky-300"
                        >
                            <Users className="h-3.5 w-3.5" />
                            Soyad
                            {renderSortIcon("lastName")}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSort("departmentName")}
                            className="col-span-3 flex cursor-pointer items-center gap-1 text-left transition-colors hover:text-sky-300"
                        >
                            <Building2 className="h-3.5 w-3.5" />
                            Departman
                            {renderSortIcon("departmentName")}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSort("positionName")}
                            className="col-span-3 flex cursor-pointer items-center gap-1 text-left transition-colors hover:text-sky-300"
                        >
                            <BriefcaseBusiness className="h-3.5 w-3.5" />
                            Pozisyon
                            {renderSortIcon("positionName")}
                        </button>
                    </div>

                    <div>
                        {loading ? (
                            <div className="px-5 py-10 text-center text-sm text-slate-400">
                                Başvurular yükleniyor...
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                                <div className="mb-4 text-5xl opacity-30">📄</div>
                                <p className="text-sm text-slate-300">Henüz başvuru bulunmuyor</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Yeni başvurular geldiğinde burada listelenecek
                                </p>
                            </div>
                        ) : (
                            filteredApplications.map((app) => {
                                const isExpanded = expandedId === app.id;
                                const canTakeAction = app.status === "PENDING";

                                return (
                                    <div
                                        key={app.id}
                                        className="border-b border-slate-800 last:border-b-0"
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpandedId((prev) => (prev === app.id ? null : app.id))
                                            }
                                            className="grid w-full cursor-pointer grid-cols-12 gap-3 px-5 py-4 text-left transition-all duration-200 hover:bg-slate-900/50"
                                        >
                                            <div className="col-span-3 flex items-center text-sm text-white">
                                                {app.firstName}
                                            </div>
                                            <div className="col-span-3 flex items-center text-sm text-white">
                                                {app.lastName}
                                            </div>
                                            <div className="col-span-3 flex items-center text-sm text-slate-300">
                                                {app.departmentName}
                                            </div>
                                            <div className="col-span-3 flex items-center justify-between gap-3 text-sm text-slate-300">
                                                <span>{app.positionName}</span>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                                )}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="border-t border-slate-800 bg-slate-900/40 px-5 py-5">
                                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                                        <h3 className="mb-4 text-sm font-semibold text-white">
                                                            Başvuru Detayı
                                                        </h3>

                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                                                                <span className="text-slate-400">Ad</span>
                                                                <span className="text-white">{app.firstName}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                                                                <span className="text-slate-400">Soyad</span>
                                                                <span className="text-white">{app.lastName}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                                                                <span className="text-slate-400">E-posta</span>
                                                                <span className="text-white">{app.email}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                                                                <span className="text-slate-400">Telefon</span>
                                                                <span className="text-white">
                                                                    {app.countryCode || ""} {app.phone || "-"}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                                                                <span className="text-slate-400">Departman</span>
                                                                <span className="text-white">{app.departmentName}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                                                                <span className="text-slate-400">Alt Departman</span>
                                                                <span className="text-white">{app.subDepartmentName}</span>
                                                            </div>

                                                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                                                                <span className="text-slate-400">Pozisyon</span>
                                                                <span className="text-white">{app.positionName}</span>
                                                            </div>



                                                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-2">
                                                                <span className="text-slate-400">Durum</span>
                                                                <span
                                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                                                        statusBadgeClasses[app.status] ||
                                                                        "bg-slate-700 text-slate-200"
                                                                    }`}
                                                                >
                                                                    {statusMap[app.status] || app.status}
                                                                </span>
                                                            </div>

                                                            <div
                                                                className={`flex items-center justify-between gap-4 pb-2 ${
                                                                    app.status !== "PENDING"
                                                                        ? "border-b border-slate-800"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <span className="text-slate-400">
                                                                    Başvuru Tarihi
                                                                </span>
                                                                <span className="text-white">
                                                                    {formatDate(app.appliedAt)}
                                                                </span>
                                                            </div>

                                                            {app.status === "ACCEPTED" && (
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span className="text-slate-400">
                                                                        Onaylanma Tarihi
                                                                    </span>
                                                                    <span className="text-white">
                                                                        {formatDate(app.reviewedAt)}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {app.status === "REJECTED" && (
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span className="text-slate-400">
                                                                        Reddedilme Tarihi
                                                                    </span>
                                                                    <span className="text-white">
                                                                        {formatDate(app.reviewedAt)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                                                        <h3 className="mb-4 text-sm font-semibold text-white">
                                                            İşlem Alanı
                                                        </h3>

                                                        <div className="flex flex-col gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openCv(
                                                                        app.id,
                                                                        `${app.firstName}-${app.lastName}`
                                                                    )
                                                                }
                                                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-500"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                CV Önizle
                                                            </button>

                                                            {canTakeAction ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openStatusModal(app.id, "ACCEPTED")
                                                                        }
                                                                        disabled={actionLoadingId === app.id}
                                                                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                        Başvuruyu Onayla
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openStatusModal(app.id, "REJECTED")
                                                                        }
                                                                        disabled={actionLoadingId === app.id}
                                                                        className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        <XCircle className="h-4 w-4" />
                                                                        Başvuruyu Reddet
                                                                    </button>

                                                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                                                                        Bu başvuru beklemede olduğu için işlem yapılabilir.
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
                                                                    <div className="mb-2 flex items-center gap-2 text-white">
                                                                        <CircleDashed className="h-4 w-4 text-sky-400" />
                                                                        İşlem Kilitli
                                                                    </div>
                                                                    <p>{getLockedMessage(app.status)}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {showAllApplications && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                        <Layers3 className="h-4 w-4 text-sky-400" />
                        Tüm başvurular aynı listede gösteriliyor. Sekme seçimi aktif olsa da tüm
                        kayıtlar görüntülenir.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CvServicePage;