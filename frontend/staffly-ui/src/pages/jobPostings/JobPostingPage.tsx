import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
    ArrowRight,
    BarChart3,
    BriefcaseBusiness,
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Code2,
    Eye,
    MapPin,
    Pencil,
    Play,
    Plus,
    RefreshCw,
    Search,
    Shield,
    SlidersHorizontal,
    Users,
    X,
    XCircle,
} from "lucide-react";

import {
    activateJobPosting,
    closeJobPosting,
    createJobPosting,
    getAllPositions,
    getApplications,
    getJobPostings,
    updateJobPosting,
} from "../../services/applicationService";

import type {
    Position,
    JobPosting,
    JobPostingStatusFilter,
    Application,
} from "../../types/cvServiceTypes";

import JobPostingFormModal, {
    type JobPostingPayload,
} from "../../components/jobPostings/JobPostingFormModal";
import JobPostingDetailModal from "../../components/jobPostings/JobPostingDetailModal";

type FilterStatus = JobPostingStatusFilter | "ALL";

type ConfirmAction = {
    type: "CLOSE" | "ACTIVATE";
    job: JobPosting;
} | null;

export default function JobPostingsPage() {
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");
    const [positionFilter, setPositionFilter] = useState("ALL");
    const [locationFilter, setLocationFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("ACTIVE");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState("");

    const [formOpen, setFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
    const [viewJob, setViewJob] = useState<JobPosting | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const fetchData = async () => {
        try {
            setLoading(true);
            setPageError("");

            const positionData = await getAllPositions();
            setPositions(Array.isArray(positionData) ? positionData : []);

            const jobData = await getJobPostings();
            setJobPostings(Array.isArray(jobData) ? jobData : []);

            const applicationData = await getApplications();
            setApplications(Array.isArray(applicationData) ? applicationData : []);
        } catch (error) {
            console.error(error);
            setPageError("İş ilanları yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchTerm,
        departmentFilter,
        positionFilter,
        locationFilter,
        statusFilter,
        pageSize,
    ]);

    const activeCount = jobPostings.filter((job) => job.status === "ACTIVE").length;
    const draftCount = jobPostings.filter((job) => job.status === "DRAFT").length;
    const closedCount = jobPostings.filter((job) => job.status === "CLOSED").length;

    const departmentOptions = useMemo(() => {
        const values = Array.from(
            new Set(jobPostings.map((job) => job.departmentName).filter(Boolean))
        );

        return [
            { value: "ALL", label: "Tüm Departmanlar" },
            ...values.map((value) => ({ value, label: value })),
        ];
    }, [jobPostings]);

    const positionOptions = useMemo(() => {
        const values = Array.from(
            new Set(jobPostings.map((job) => job.positionName).filter(Boolean))
        );

        return [
            { value: "ALL", label: "Tüm Pozisyonlar" },
            ...values.map((value) => ({ value, label: value })),
        ];
    }, [jobPostings]);

    const locationOptions = useMemo(() => {
        const values = Array.from(
            new Set(jobPostings.map((job) => job.location).filter(Boolean))
        ) as string[];

        return [
            { value: "ALL", label: "Tüm Lokasyonlar" },
            ...values.map((value) => ({ value, label: value })),
        ];
    }, [jobPostings]);

    const filteredJobPostings = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return jobPostings.filter((job) => {
            const matchesSearch =
                !search ||
                job.title.toLowerCase().includes(search) ||
                job.positionName.toLowerCase().includes(search) ||
                job.departmentName.toLowerCase().includes(search) ||
                job.subDepartmentName.toLowerCase().includes(search) ||
                (job.location || "").toLowerCase().includes(search);

            const matchesDepartment =
                departmentFilter === "ALL" || job.departmentName === departmentFilter;

            const matchesPosition =
                positionFilter === "ALL" || job.positionName === positionFilter;

            const matchesLocation =
                locationFilter === "ALL" || job.location === locationFilter;

            const matchesStatus =
                statusFilter === "ALL" || job.status === statusFilter;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesPosition &&
                matchesLocation &&
                matchesStatus
            );
        });
    }, [
        jobPostings,
        searchTerm,
        departmentFilter,
        positionFilter,
        locationFilter,
        statusFilter,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredJobPostings.length / pageSize));

    const paginatedJobs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;

        return filteredJobPostings.slice(start, end);
    }, [filteredJobPostings, currentPage, pageSize]);

    const visibleListLabel =
        statusFilter === "ACTIVE"
            ? "Aktif ilanlar"
            : statusFilter === "DRAFT"
                ? "Taslak ilanlar"
                : statusFilter === "CLOSED"
                    ? "Kapalı ilanlar"
                    : "Tüm ilanlar";

    const clearFilters = () => {
        setSearchTerm("");
        setDepartmentFilter("ALL");
        setPositionFilter("ALL");
        setLocationFilter("ALL");
        setStatusFilter("ACTIVE");
        setCurrentPage(1);
    };

    const openCreateModal = () => {
        setEditingJob(null);
        setFormOpen(true);
    };

    const openEditModal = (job: JobPosting) => {
        setViewJob(null);
        setEditingJob(job);
        setFormOpen(true);
    };

    const closeFormModal = () => {
        setFormOpen(false);
        setEditingJob(null);
    };

    const handleSubmitJobPosting = async (
        payload: JobPostingPayload,
        selectedEditingJob: JobPosting | null
    ) => {
        try {
            setSaving(true);
            setPageError("");

            if (selectedEditingJob) {
                await updateJobPosting(selectedEditingJob.id, payload);
            } else {
                await createJobPosting(payload);
            }

            closeFormModal();
            await fetchData();
        } catch (error) {
            console.error(error);
            setPageError(
                selectedEditingJob
                    ? "İş ilanı güncellenirken hata oluştu."
                    : "İş ilanı oluşturulurken hata oluştu."
            );
        } finally {
            setSaving(false);
        }
    };

    const requestCloseJob = (job: JobPosting) => {
        setConfirmAction({
            type: "CLOSE",
            job,
        });
    };

    const requestActivateJob = (job: JobPosting) => {
        setConfirmAction({
            type: "ACTIVATE",
            job,
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        try {
            setConfirmLoading(true);
            setPageError("");

            if (confirmAction.type === "CLOSE") {
                await closeJobPosting(confirmAction.job.id);
            } else {
                await activateJobPosting(confirmAction.job.id);
            }

            setConfirmAction(null);
            setViewJob(null);
            await fetchData();
        } catch (error) {
            console.error(error);
            setPageError(
                confirmAction.type === "CLOSE"
                    ? "İlan kapatılırken hata oluştu."
                    : "İlan aktif edilirken hata oluştu."
            );
        } finally {
            setConfirmLoading(false);
        }
    };

    const getApplicationCount = (job: JobPosting) => {
        return applications.filter((application) => application.jobPostingId === job.id).length;
    };

    return (
        <>
            <div className="min-h-full w-full bg-[#020617] p-0 text-white">
                <div className="flex min-h-screen w-full flex-col rounded-none border-0 border-white/10 bg-slate-950/55 p-5 shadow-[0_0_55px_rgba(15,23,42,0.75)]">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white">
                                İş İlanları
                            </h1>
                            <p className="mt-1 text-sm text-slate-300">
                                Açık pozisyonları oluşturun, yayınlayın veya kapatın.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-[0_18px_40px_rgba(37,99,235,0.35)] transition hover:scale-[1.01] hover:opacity-95"
                        >
                            <Plus className="h-5 w-5" />
                            Yeni İş İlanı
                        </button>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                        <StatCard
                            title="Aktif İlanlar"
                            value={activeCount}
                            description="Yayında olan ilanlar"
                            color="blue"
                            icon={<BriefcaseBusiness className="h-8 w-8" />}
                            active={statusFilter === "ACTIVE"}
                            onClick={() => setStatusFilter("ACTIVE")}
                        />

                        <StatCard
                            title="Taslak İlanlar"
                            value={draftCount}
                            description="Yayınlanmayı bekleyen ilanlar"
                            color="amber"
                            icon={<Clock3 className="h-8 w-8" />}
                            active={statusFilter === "DRAFT"}
                            onClick={() => setStatusFilter("DRAFT")}
                        />

                        <StatCard
                            title="Kapalı İlanlar"
                            value={closedCount}
                            description="Kapatılan ilanlar"
                            color="rose"
                            icon={<XCircle className="h-8 w-8" />}
                            active={statusFilter === "CLOSED"}
                            onClick={() => setStatusFilter("CLOSED")}
                        />
                    </div>

                    <div className="mb-4 rounded-2xl border border-white/10 bg-slate-900/40 p-3">
                        <div className="grid grid-cols-1 gap-3 2xl:grid-cols-[1.5fr_0.85fr_0.85fr_0.85fr_0.75fr_auto]">
                            <div className="flex h-[48px] items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 px-4 shadow-inner shadow-black/20 transition focus-within:border-blue-400/50">
                                <Search className="h-5 w-5 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Başlık, departman, pozisyon veya konum ile ara..."
                                    className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
                                />
                            </div>

                            <CustomSelect
                                icon={<Building2 className="h-5 w-5" />}
                                value={departmentFilter}
                                onChange={setDepartmentFilter}
                                options={departmentOptions}
                            />

                            <CustomSelect
                                icon={<BriefcaseBusiness className="h-5 w-5" />}
                                value={positionFilter}
                                onChange={setPositionFilter}
                                options={positionOptions}
                            />

                            <CustomSelect
                                icon={<MapPin className="h-5 w-5" />}
                                value={locationFilter}
                                onChange={setLocationFilter}
                                options={locationOptions}
                            />

                            <CustomSelect
                                icon={<SlidersHorizontal className="h-5 w-5" />}
                                value={statusFilter}
                                onChange={(value) => setStatusFilter(value as FilterStatus)}
                                options={[
                                    { value: "ALL", label: "Tüm Durumlar" },
                                    { value: "ACTIVE", label: "Aktif" },
                                    { value: "DRAFT", label: "Taslak" },
                                    { value: "CLOSED", label: "Kapalı" },
                                ]}
                            />

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm font-semibold text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Filtreleri Temizle
                            </button>
                        </div>
                    </div>

                    <div className="mb-4 text-sm text-slate-400">
                        Görünen liste:{" "}
                        <span className="font-bold text-blue-400">
                            {visibleListLabel}
                        </span>
                    </div>

                    {pageError && (
                        <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                            {pageError}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/75">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1240px] table-fixed">
                                <thead>
                                <tr className="border-b border-white/10 bg-slate-900/55 text-left text-sm font-bold text-slate-400">
                                    <th className="w-[22%] px-5 py-4">İlan Başlığı</th>
                                    <th className="w-[14%] px-5 py-4">Departman</th>
                                    <th className="w-[15%] px-5 py-4">Pozisyon</th>
                                    <th className="w-[15%] px-5 py-4">Lokasyon</th>
                                    <th className="w-[9%] px-5 py-4">Durum</th>
                                    <th className="w-[12%] px-5 py-4">Son Başvuru</th>
                                    <th className="w-[7%] px-5 py-4 text-center">Başvuru</th>
                                    <th className="w-[10%] px-5 py-4 text-right">İşlemler</th>
                                </tr>
                                </thead>

                                <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-5 py-20 text-center text-sm text-slate-400"
                                        >
                                            İş ilanları yükleniyor...
                                        </td>
                                    </tr>
                                ) : paginatedJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-20 text-center">
                                            <BriefcaseBusiness className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                                            <p className="text-sm font-semibold text-white">
                                                Uygun ilan bulunamadı
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Filtreleri değiştirerek tekrar deneyebilirsiniz.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedJobs.map((job, index) => (
                                        <tr
                                            key={job.id}
                                            className="border-b border-white/10 text-sm text-slate-300 transition hover:bg-slate-900/55"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-4">
                                                    <JobIcon index={index} status={job.status} />

                                                    <div>
                                                        <p className="font-bold text-white">
                                                            {job.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                            <span className="flex min-w-0 items-center gap-2">
                                            <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                                            <span className="truncate">{job.departmentName}</span>
                                            </span>
                                            </td>

                                            <td className="px-5 py-4">
                                            <span className="flex min-w-0 items-center gap-2">
                                                <BriefcaseBusiness className="h-4 w-4 shrink-0 text-slate-400" />
                                            <span className="truncate">{job.positionName}</span>
                                            </span>
                                            </td>

                                            <td className="px-5 py-4">
                                             <span className="flex min-w-0 items-center gap-2">
                                                <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                                                <span className="truncate">{job.location || "—"}</span>
                                            </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge status={job.status} />
                                            </td>

                                            <td className="px-5 py-4">
                                                {formatDate(job.applicationDeadline)}
                                            </td>

                                            <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center justify-center gap-2">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            {getApplicationCount(job)}
                                            </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex min-w-[120px] justify-end gap-2">
                                                    <ActionButton
                                                        title="Detay"
                                                        onClick={() => setViewJob(job)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </ActionButton>

                                                    <ActionButton
                                                        title="Düzenle"
                                                        onClick={() => openEditModal(job)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </ActionButton>

                                                    {job.status === "DRAFT" || job.status === "CLOSED" ? (
                                                        <ActionButton
                                                            title="Aktif et"
                                                            onClick={() => requestActivateJob(job)}
                                                            variant="success"
                                                        >
                                                            <Play className="h-4 w-4" />
                                                        </ActionButton>
                                                    ) : (
                                                        <ActionButton
                                                            title="İlanı kapat"
                                                            onClick={() => requestCloseJob(job)}
                                                            variant="danger"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </ActionButton>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            totalItems={filteredJobPostings.length}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(value) => {
                                setPageSize(value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            {viewJob && (
                <JobPostingDetailModal
                    job={viewJob}
                    onClose={() => setViewJob(null)}
                />
            )}

            <JobPostingFormModal
                open={formOpen}
                positions={positions}
                draftJobs={jobPostings.filter((job) => job.status === "DRAFT")}
                editingJob={editingJob}
                saving={saving}
                onClose={closeFormModal}
                onSubmit={handleSubmitJobPosting}
            />

            {confirmAction && (
                <ConfirmModal
                    action={confirmAction}
                    loading={confirmLoading}
                    onCancel={() => setConfirmAction(null)}
                    onConfirm={handleConfirmAction}
                />
            )}
        </>
    );
}

function StatCard({
                      title,
                      value,
                      description,
                      color,
                      icon,
                      active,
                      onClick,
                  }: {
    title: string;
    value: number;
    description: string;
    color: "blue" | "amber" | "rose";
    icon: ReactNode;
    active: boolean;
    onClick: () => void;
}) {
    const styles = {
        blue: {
            card: "border-blue-400/25 bg-blue-500/10",
            icon: "bg-blue-500/15 text-blue-300 shadow-[0_0_32px_rgba(37,99,235,0.28)]",
            text: "text-blue-200",
            arrow: "bg-blue-500/15 text-blue-300",
        },
        amber: {
            card: "border-amber-400/25 bg-amber-500/10",
            icon: "bg-amber-500/15 text-amber-300 shadow-[0_0_32px_rgba(245,158,11,0.18)]",
            text: "text-amber-200",
            arrow: "bg-amber-500/15 text-amber-300",
        },
        rose: {
            card: "border-rose-400/25 bg-rose-500/10",
            icon: "bg-rose-500/15 text-rose-300 shadow-[0_0_32px_rgba(244,63,94,0.18)]",
            text: "text-rose-200",
            arrow: "bg-rose-500/15 text-rose-300",
        },
    };

    const selected = styles[color];

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-2xl border p-5 text-left transition ${
                selected.card
            } ${
                active
                    ? "ring-1 ring-white/20"
                    : "hover:border-white/20 hover:bg-white/[0.04]"
            }`}
        >
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    <div
                        className={`flex h-16 w-16 items-center justify-center rounded-full ${selected.icon}`}
                    >
                        {icon}
                    </div>

                    <div>
                        <p className={`text-sm font-bold ${selected.text}`}>
                            {title}
                        </p>
                        <p className="mt-1 text-3xl font-extrabold text-white">
                            {value}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                            {description}
                        </p>
                    </div>
                </div>

                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${selected.arrow}`}
                >
                    <ArrowRight className="h-5 w-5" />
                </div>
            </div>
        </button>
    );
}

function CustomSelect({
                          icon,
                          value,
                          onChange,
                          options,
                      }: {
    icon: ReactNode;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    const selected = options.find((option) => option.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`flex h-[48px] w-full items-center gap-3 rounded-xl border px-4 text-left text-sm font-semibold transition ${
                    open
                        ? "border-blue-400/50 bg-slate-950"
                        : "border-white/10 bg-slate-950/70 hover:border-blue-400/30"
                }`}
            >
                <span className="text-slate-400">{icon}</span>
                <span className="min-w-0 flex-1 truncate text-white">
                    {selected?.label}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1000] overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-[0_25px_70px_rgba(0,0,0,0.65)]">
                    <div className="max-h-64 overflow-y-auto py-1">
                        {options.map((option) => {
                            const active = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                                        active
                                            ? "bg-blue-500/15 text-blue-300"
                                            : "text-slate-300 hover:bg-slate-900 hover:text-white"
                                    }`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {active && (
                                        <span className="h-2 w-2 rounded-full bg-blue-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === "ACTIVE") {
        return (
            <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Aktif
            </span>
        );
    }

    if (status === "DRAFT") {
        return (
            <span className="inline-flex items-center gap-2 rounded-lg border border-amber-400/25 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Taslak
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-lg border border-rose-400/25 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Kapalı
        </span>
    );
}

function JobIcon({ index, status }: { index: number; status: string }) {
    const icons = [
        <Code2 className="h-5 w-5" />,
        <BarChart3 className="h-5 w-5" />,
        <Users className="h-5 w-5" />,
        <BriefcaseBusiness className="h-5 w-5" />,
        <Shield className="h-5 w-5" />,
    ];

    const color =
        status === "ACTIVE"
            ? "border-violet-400/35 bg-violet-500/15 text-violet-300"
            : status === "DRAFT"
                ? "border-amber-400/35 bg-amber-500/15 text-amber-300"
                : "border-rose-400/35 bg-rose-500/15 text-rose-300";

    return (
        <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${color}`}
        >
            {icons[index % icons.length]}
        </div>
    );
}

function ActionButton({
                          children,
                          title,
                          onClick,
                          variant = "default",
                      }: {
    children: ReactNode;
    title: string;
    onClick: () => void;
    variant?: "default" | "danger" | "success";
}) {
    const variantClass =
        variant === "danger"
            ? "hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-300"
            : variant === "success"
                ? "hover:border-emerald-400/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                : "hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300";

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-900/80 text-slate-300 transition ${variantClass}`}
        >
            {children}
        </button>
    );
}

function Pagination({
                        totalItems,
                        currentPage,
                        totalPages,
                        pageSize,
                        onPageChange,
                        onPageSizeChange,
                    }: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}) {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    const visiblePages = pages.filter((page) => {
        if (totalPages <= 5) return true;
        if (page === 1 || page === totalPages) return true;

        return Math.abs(page - currentPage) <= 1;
    });

    return (
        <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-4 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between">
            <div>
                Toplam <span className="font-bold text-white">{totalItems}</span> ilan
            </div>

            <div className="flex items-center justify-center gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {visiblePages.map((page, index) => {
                    const previousPage = visiblePages[index - 1];
                    const showDots = previousPage && page - previousPage > 1;

                    return (
                        <div key={page} className="flex items-center gap-2">
                            {showDots && <span className="px-2 text-slate-500">...</span>}

                            <button
                                onClick={() => onPageChange(page)}
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition ${
                                    currentPage === page
                                        ? "border-blue-400 bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,0.45)]"
                                        : "border-white/10 bg-slate-900 text-slate-300 hover:bg-blue-500/20"
                                }`}
                            >
                                {page}
                            </button>
                        </div>
                    );
                })}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-10 rounded-xl border border-white/10 bg-slate-900 px-3 text-sm font-semibold text-slate-300 outline-none"
            >
                <option value={5}>5 / sayfa</option>
                <option value={10}>10 / sayfa</option>
                <option value={20}>20 / sayfa</option>
                <option value={50}>50 / sayfa</option>
            </select>
        </div>
    );
}

function ConfirmModal({
                          action,
                          loading,
                          onCancel,
                          onConfirm,
                      }: {
    action: {
        type: "CLOSE" | "ACTIVATE";
        job: JobPosting;
    };
    loading: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const isClose = action.type === "CLOSE";

    return (
        <div
            className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md rounded-3xl border border-white/10 bg-[#030817] p-6 shadow-[0_0_70px_rgba(15,23,42,0.95)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                            isClose
                                ? "bg-rose-500/15 text-rose-300"
                                : "bg-emerald-500/15 text-emerald-300"
                        }`}
                    >
                        {isClose ? (
                            <XCircle className="h-7 w-7" />
                        ) : (
                            <Play className="h-7 w-7" />
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                    {isClose ? "İlanı Kapat" : "İlanı Aktif Et"}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-300">
                    <span className="font-bold text-white">{action.job.title}</span>{" "}
                    ilanını {isClose ? "kapatmak" : "tekrar aktif etmek"} istiyor musunuz?
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-60"
                    >
                        Vazgeç
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-2xl px-4 py-3 text-sm font-bold text-white transition disabled:opacity-60 ${
                            isClose
                                ? "bg-rose-600 hover:bg-rose-500"
                                : "bg-emerald-600 hover:bg-emerald-500"
                        }`}
                    >
                        {loading
                            ? "İşleniyor..."
                            : isClose
                                ? "Evet, Kapat"
                                : "Evet, Aktif Et"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function formatDate(date?: string) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}