import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    Clock3,
    MapPin,
    Plus,
    Search,
    X,
    XCircle,
} from "lucide-react";
import {
    activateJobPosting,
    closeJobPosting,
    createJobPosting,
    getAllPositions,
    getJobPostings,
} from "../../services/applicationService";

import type {
    Position,
    JobPosting,
    JobPostingStatusFilter,
} from "../../types/cvServiceTypes";



const emptyForm = {
    title: "",
    description: "",
    positionId: "",
    experienceLevel: "",
    employmentType: "FULL_TIME",
    workModel: "HYBRID",
    location: "",
    requirements: "",
    responsibilities: "",
    benefits: "",
    teamInfo: "",
    status: "ACTIVE",
    applicationDeadline: "",
};

const employmentTypeMap: Record<string, string> = {
    FULL_TIME: "Tam Zamanlı",
    PART_TIME: "Yarı Zamanlı",
    INTERNSHIP: "Staj",
    CONTRACT: "Sözleşmeli",
};

const workModelMap: Record<string, string> = {
    ON_SITE: "Ofis",
    REMOTE: "Uzaktan",
    HYBRID: "Hibrit",
};

type StatusFilter = "ACTIVE" | "DRAFT" | "CLOSED";

/** Son başvuru: geçmiş takvim yılları seçilemesin (min = yılın 1 Ocak'ı, bugünkü yıl). */
function minApplicationDeadlineDate(): string {
    const y = new Date().getFullYear();
    return `${y}-01-01`;
}

export default function JobPostingsPage() {
    const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState("");
    const [form, setForm] = useState(emptyForm);
    const [statusFilter, setStatusFilter] = useState<JobPostingStatusFilter>("ACTIVE");
    const [viewJob, setViewJob] = useState<JobPosting | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setPageError("");

            // ayrı ayrı çek
            const positionData = await getAllPositions();
            setPositions(positionData);

            try {
                const jobData = await getJobPostings();
                setJobPostings(jobData);
            } catch (error) {
                console.error("Job postings hatası:", error);
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredJobPostings = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return jobPostings.filter((job) => {
            if (job.status !== statusFilter) return false;

            return (
                job.title.toLowerCase().includes(search) ||
                job.positionName.toLowerCase().includes(search) ||
                job.departmentName.toLowerCase().includes(search) ||
                job.subDepartmentName.toLowerCase().includes(search) ||
                (job.location || "").toLowerCase().includes(search)
            );
        });
    }, [jobPostings, searchTerm, statusFilter]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setFormOpen(false);
    };

    const handleCreateJobPosting = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) {
            setPageError("İlan başlığı zorunludur.");
            return;
        }

        if (!form.description.trim()) {
            setPageError("İlan açıklaması zorunludur.");
            return;
        }

        if (!form.positionId) {
            setPageError("Pozisyon seçimi zorunludur.");
            return;
        }

        try {
            setSaving(true);
            setPageError("");

            await createJobPosting({
                title: form.title.trim(),
                description: form.description.trim(),
                positionId: Number(form.positionId),
                experienceLevel: form.experienceLevel.trim(),
                employmentType: form.employmentType,
                workModel: form.workModel,
                location: form.location.trim(),
                requirements: form.requirements.trim(),
                responsibilities: form.responsibilities.trim(),
                benefits: form.benefits.trim(),
                teamInfo: form.teamInfo.trim(),
                status: form.status,
                applicationDeadline: form.applicationDeadline || null,
            });

            resetForm();
            await fetchData();
        } catch (error) {
            console.error(error);
            setPageError("İş ilanı oluşturulurken hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    const handleCloseJobPosting = async (id: number) => {
        try {
            await closeJobPosting(id);
            setViewJob((j) => (j?.id === id ? null : j));
            await fetchData();
        } catch (error) {
            console.error(error);
            setPageError("İlan kapatılırken hata oluştu.");
        }
    };

    const handleActivateJobPosting = async (id: number) => {
        try {
            await activateJobPosting(id);
            setViewJob((j) => (j?.id === id ? null : j));
            await fetchData();
        } catch (error) {
            console.error(error);
            setPageError("İlan aktif edilirken hata oluştu.");
        }
    };

    const activeCount = jobPostings.filter((job) => job.status === "ACTIVE").length;
    const draftCount = jobPostings.filter((job) => job.status === "DRAFT").length;
    const closedCount = jobPostings.filter((job) => job.status === "CLOSED").length;

    const jobDetailModal =
        viewJob &&
        createPortal(
            <div className="fixed inset-0 z-[9990] overflow-y-auto bg-black/80 backdrop-blur-sm">
                <div className="flex min-h-full w-full items-center justify-center px-3 py-8 sm:px-6 sm:py-10">
                    <div className="my-auto flex w-full max-w-3xl max-h-[min(90vh,880px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_60px_rgba(2,6,23,0.9)]">
                        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                            <h2 className="text-lg font-semibold text-white">İlan detayı</h2>
                            <button
                                type="button"
                                onClick={() => setViewJob(null)}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                aria-label="Kapat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="staffly-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                            <div className="mb-3 flex flex-wrap gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        viewJob.status === "ACTIVE"
                                            ? "bg-emerald-500/15 text-emerald-300"
                                            : viewJob.status === "DRAFT"
                                              ? "bg-amber-500/15 text-amber-300"
                                              : "bg-rose-500/15 text-rose-300"
                                    }`}
                                >
                                    {viewJob.status === "ACTIVE"
                                        ? "Aktif"
                                        : viewJob.status === "DRAFT"
                                          ? "Taslak"
                                          : "Kapalı"}
                                </span>
                                {viewJob.applicationDeadline && (
                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                                        Son başvuru: {viewJob.applicationDeadline}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-2xl font-bold text-white">{viewJob.title}</h3>
                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="h-4 w-4 shrink-0" />
                                    {viewJob.departmentName} / {viewJob.subDepartmentName}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <BriefcaseBusiness className="h-4 w-4 shrink-0" />
                                    {viewJob.positionName}
                                </span>
                                {viewJob.location && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        {viewJob.location}
                                    </span>
                                )}
                            </div>
                            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                                {viewJob.description}
                            </p>
                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Tecrübe</p>
                                    <p className="mt-1 text-sm text-white">{viewJob.experienceLevel || "—"}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Çalışma Tipi</p>
                                    <p className="mt-1 text-sm text-white">
                                        {employmentTypeMap[viewJob.employmentType || ""] || "—"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                                    <p className="text-xs text-slate-500">Model</p>
                                    <p className="mt-1 text-sm text-white">
                                        {workModelMap[viewJob.workModel || ""] || "—"}
                                    </p>
                                </div>
                            </div>
                            {viewJob.requirements?.trim() && (
                                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                    <p className="text-xs font-medium text-slate-400">Beklenenler</p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                                        {viewJob.requirements}
                                    </p>
                                </div>
                            )}
                            {viewJob.responsibilities?.trim() && (
                                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                    <p className="text-xs font-medium text-slate-400">Sorumluluklar</p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                                        {viewJob.responsibilities}
                                    </p>
                                </div>
                            )}
                            {viewJob.benefits?.trim() && (
                                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                    <p className="text-xs font-medium text-slate-400">Yan haklar</p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{viewJob.benefits}</p>
                                </div>
                            )}
                            {viewJob.teamInfo?.trim() && (
                                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                                    <p className="text-xs font-medium text-slate-400">Ekip</p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{viewJob.teamInfo}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex shrink-0 gap-3 border-t border-white/10 bg-slate-950 px-5 py-4 sm:px-6">
                            {viewJob.status === "ACTIVE" ? (
                                <button
                                    type="button"
                                    onClick={() => handleCloseJobPosting(viewJob.id)}
                                    className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
                                >
                                    İlanı Kapat
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleActivateJobPosting(viewJob.id)}
                                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                                >
                                    Aktif Et
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );

    const newJobModal =
        formOpen &&
        createPortal(
            <div className="fixed inset-0 z-[10000] overflow-y-auto bg-black/75 backdrop-blur-sm">
                <div className="flex min-h-full w-full items-center justify-center px-3 py-8 sm:px-6 sm:py-10">
                    <div className="my-auto flex w-full max-w-5xl max-h-[min(92vh,900px)] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-[0_0_55px_rgba(2,6,23,0.9)]">
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Yeni İş İlanı Oluştur</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    HR tarafından yayınlanacak açık pozisyon bilgilerini girin.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateJobPosting}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="staffly-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-2 sm:px-6">
                                <div className="space-y-5">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        İlan Başlığı
                                    </label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Örn: Recruitment Specialist"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Pozisyon
                                    </label>
                                    <select
                                        name="positionId"
                                        value={form.positionId}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                                    >
                                        <option value="">Pozisyon seçiniz</option>
                                        {positions.map((position) => (
                                            <option key={position.id} value={position.id}>
                                                {position.name || position.positionName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-400">
                                    İlan Açıklaması
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Pozisyonun genel açıklamasını girin..."
                                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Tecrübe
                                    </label>
                                    <input
                                        name="experienceLevel"
                                        value={form.experienceLevel}
                                        onChange={handleChange}
                                        placeholder="1-3 yıl"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Çalışma Tipi
                                    </label>
                                    <select
                                        name="employmentType"
                                        value={form.employmentType}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                                    >
                                        <option value="FULL_TIME">Tam Zamanlı</option>
                                        <option value="PART_TIME">Yarı Zamanlı</option>
                                        <option value="INTERNSHIP">Staj</option>
                                        <option value="CONTRACT">Sözleşmeli</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Çalışma Modeli
                                    </label>
                                    <select
                                        name="workModel"
                                        value={form.workModel}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                                    >
                                        <option value="ON_SITE">Ofis</option>
                                        <option value="REMOTE">Uzaktan</option>
                                        <option value="HYBRID">Hibrit</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Son Başvuru
                                    </label>
                                    <input
                                        type="date"
                                        name="applicationDeadline"
                                        value={form.applicationDeadline}
                                        min={minApplicationDeadlineDate()}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Konum
                                    </label>
                                    <input
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="İstanbul / Gebze / Remote"
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Durum
                                    </label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
                                    >
                                        <option value="ACTIVE">Aktif Yayınla</option>
                                        <option value="DRAFT">Taslak Kaydet</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Beklenenler
                                    </label>
                                    <textarea
                                        name="requirements"
                                        value={form.requirements}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Adaydan beklenen yetkinlikleri yazın..."
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Yapacağınız İşler
                                    </label>
                                    <textarea
                                        name="responsibilities"
                                        value={form.responsibilities}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Bu pozisyondaki sorumlulukları yazın..."
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Yan Haklar
                                    </label>
                                    <textarea
                                        name="benefits"
                                        value={form.benefits}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Yemek, ulaşım, hibrit çalışma vb."
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Ekibimiz
                                    </label>
                                    <textarea
                                        name="teamInfo"
                                        value={form.teamInfo}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Adayın katılacağı ekip hakkında bilgi..."
                                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                                    />
                                </div>
                            </div>
                                </div>
                            </div>

                            <div className="flex shrink-0 gap-3 border-t border-white/10 bg-slate-950/95 px-5 py-4 sm:px-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3.5 text-sm font-medium text-white hover:bg-slate-800"
                                >
                                    Vazgeç
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                >
                                    {saving ? "Kaydediliyor..." : "İlan Oluştur"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>,
            document.body
        );

    return (
        <>
            <div className="min-h-screen bg-[#020617] px-3 py-5 text-white sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[92rem]">
                <div className="mb-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
                                İş İlanları
                            </h1>
                            <p className="mt-1 text-sm text-slate-300">
                                Açık pozisyonları oluşturun, yayınlayın veya kapatın.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setFormOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(56,189,248,0.35)] transition hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            Yeni İş İlanı
                        </button>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => setStatusFilter("ACTIVE")}
                            className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                                statusFilter === "ACTIVE"
                                    ? "border-sky-400 bg-sky-500/15 shadow-[0_0_28px_rgba(56,189,248,0.2)] ring-1 ring-sky-400/40"
                                    : "border-sky-500/25 bg-sky-500/5 hover:border-sky-400/50 hover:bg-sky-500/10"
                            }`}
                        >
                            <div className="flex items-center gap-2 text-sm text-sky-200">
                                <CheckCircle2 className="h-4 w-4" />
                                Aktif İlanlar
                            </div>
                            <p className="mt-2 text-2xl font-bold text-white">{activeCount}</p>
                            <p className="mt-2 text-xs text-slate-400">Listeyi görmek için tıklayın</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatusFilter("DRAFT")}
                            className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                                statusFilter === "DRAFT"
                                    ? "border-amber-400 bg-amber-500/15 shadow-[0_0_28px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/40"
                                    : "border-amber-500/25 bg-amber-500/5 hover:border-amber-400/50 hover:bg-amber-500/10"
                            }`}
                        >
                            <div className="flex items-center gap-2 text-sm text-amber-200">
                                <Clock3 className="h-4 w-4" />
                                Taslak İlanlar
                            </div>
                            <p className="mt-2 text-2xl font-bold text-white">{draftCount}</p>
                            <p className="mt-2 text-xs text-slate-400">Listeyi görmek için tıklayın</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatusFilter("CLOSED")}
                            className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                                statusFilter === "CLOSED"
                                    ? "border-rose-400 bg-rose-500/15 shadow-[0_0_28px_rgba(244,63,94,0.15)] ring-1 ring-rose-400/35"
                                    : "border-rose-500/25 bg-rose-500/5 hover:border-rose-400/50 hover:bg-rose-500/10"
                            }`}
                        >
                            <div className="flex items-center gap-2 text-sm text-rose-200">
                                <XCircle className="h-4 w-4" />
                                Kapalı İlanlar
                            </div>
                            <p className="mt-2 text-2xl font-bold text-white">{closedCount}</p>
                            <p className="mt-2 text-xs text-slate-400">Listeyi görmek için tıklayın</p>
                        </button>
                    </div>

                    <div className="relative mt-5">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Başlık, departman, pozisyon veya konum ile ara..."
                            className="h-[56px] w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                        Görünen liste:{" "}
                        <span className="font-medium text-slate-300">
                            {statusFilter === "ACTIVE"
                                ? "Aktif ilanlar"
                                : statusFilter === "DRAFT"
                                  ? "Taslak ilanlar"
                                  : "Kapalı ilanlar"}
                        </span>
                    </p>
                </div>

                {pageError && (
                    <div className="mb-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                        {pageError}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-10 text-center text-sm text-slate-400">
                        İş ilanları yükleniyor...
                    </div>
                ) : filteredJobPostings.length === 0 ? (
                    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/90 to-slate-900/50 p-14 text-center">
                        <BriefcaseBusiness className="mx-auto mb-4 h-12 w-12 text-slate-600" />
                        <p className="text-sm text-slate-300">
                            {jobPostings.length === 0
                                ? "Henüz iş ilanı bulunmuyor."
                                : "Bu sekmede veya arama kriterlerinize uygun ilan yok."}
                        </p>
                    </div>
                ) : (
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
                        {filteredJobPostings.map((job) => (
                            <div
                                key={job.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setViewJob(job)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        setViewJob(job);
                                    }
                                }}
                                className="cursor-pointer rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950/95 via-slate-950/80 to-slate-900/40 p-6 shadow-[0_20px_50px_rgba(2,6,23,0.55)] outline-none ring-0 transition hover:border-sky-500/35 hover:shadow-[0_24px_60px_rgba(56,189,248,0.12)] focus-visible:ring-2 focus-visible:ring-sky-500/40"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                                    job.status === "ACTIVE"
                                                        ? "bg-emerald-500/15 text-emerald-300"
                                                        : job.status === "DRAFT"
                                                          ? "bg-amber-500/15 text-amber-300"
                                                          : "bg-rose-500/15 text-rose-300"
                                                }`}
                                            >
                                                {job.status === "ACTIVE"
                                                    ? "Aktif"
                                                    : job.status === "DRAFT"
                                                      ? "Taslak"
                                                      : "Kapalı"}
                                            </span>

                                            {job.applicationDeadline && (
                                                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                                                    Son başvuru: {job.applicationDeadline}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                                            {job.title}
                                        </h2>

                                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Building2 className="h-4 w-4 shrink-0 text-sky-400/80" />
                                                {job.departmentName} / {job.subDepartmentName}
                                            </span>

                                            <span className="flex items-center gap-1.5">
                                                <BriefcaseBusiness className="h-4 w-4 shrink-0 text-sky-400/80" />
                                                {job.positionName}
                                            </span>

                                            {job.location && (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4 shrink-0 text-sky-400/80" />
                                                    {job.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                                        Detay için tıklayın
                                    </span>
                                </div>

                                <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-300">
                                    {job.description}
                                </p>

                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3">
                                        <p className="text-xs text-slate-500">Tecrübe</p>
                                        <p className="mt-1 text-sm text-white">{job.experienceLevel || "—"}</p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3">
                                        <p className="text-xs text-slate-500">Çalışma Tipi</p>
                                        <p className="mt-1 text-sm text-white">
                                            {employmentTypeMap[job.employmentType || ""] || "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-3">
                                        <p className="text-xs text-slate-500">Model</p>
                                        <p className="mt-1 text-sm text-white">
                                            {workModelMap[job.workModel || ""] || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex gap-3">
                                    {job.status === "ACTIVE" ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCloseJobPosting(job.id);
                                            }}
                                            className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
                                        >
                                            İlanı Kapat
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActivateJobPosting(job.id);
                                            }}
                                            className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
                                        >
                                            Aktif Et
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </div>
            {jobDetailModal}
            {newJobModal}
        </>
    );
}