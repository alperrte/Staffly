import {
    BadgeCheck,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    Clock3,
    FileText,
    Layers3,
    MapPin,
    Sparkles,
    UsersRound,
    X,
} from "lucide-react";

import type { JobPosting } from "../../types/cvServiceTypes";

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

const formatDate = (date?: string) => {
    if (!date) return "Belirtilmedi";

    return new Date(date).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const StatusBadge = ({ status }: { status: string }) => {
    if (status === "ACTIVE") {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                Aktif İlan
            </span>
        );
    }

    if (status === "DRAFT") {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                Taslak İlan
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/25 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.8)]" />
            Kapalı İlan
        </span>
    );
};

const SmallPill = ({
                       icon,
                       children,
                       color = "blue",
                   }: {
    icon: React.ReactNode;
    children: React.ReactNode;
    color?: "blue" | "violet" | "cyan";
}) => {
    const colorClass =
        color === "violet"
            ? "border-violet-400/20 bg-violet-500/10 text-violet-200"
            : color === "cyan"
                ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                : "border-blue-400/20 bg-blue-500/10 text-blue-200";

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${colorClass}`}
        >
            {icon}
            {children}
        </span>
    );
};

const SummaryCard = ({
                         icon,
                         label,
                         value,
                         color,
                     }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: "blue" | "emerald" | "violet" | "amber";
}) => {
    const colorClass =
        color === "emerald"
            ? "bg-emerald-500/10 text-emerald-300"
            : color === "violet"
                ? "bg-violet-500/10 text-violet-300"
                : color === "amber"
                    ? "bg-amber-500/10 text-amber-300"
                    : "bg-blue-500/10 text-blue-300";

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/45 p-4 shadow-inner shadow-black/20">
            <div className="flex items-center gap-3">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
                >
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="mt-1 truncate text-sm font-bold text-white">
                        {value || "Belirtilmedi"}
                    </p>
                </div>
            </div>
        </div>
    );
};

const DetailSection = ({
                           title,
                           value,
                           icon,
                       }: {
    title: string;
    value?: string | null;
    icon: React.ReactNode;
}) => {
    const hasValue = Boolean(value?.trim());

    return (
        <section className="rounded-2xl border border-white/10 bg-slate-900/35 p-5">
            <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                    {icon}
                </div>

                <p className="text-sm font-bold text-white">{title}</p>
            </div>

            <p
                className={`whitespace-pre-wrap text-sm leading-7 ${
                    hasValue ? "text-slate-300" : "text-slate-500"
                }`}
            >
                {hasValue ? value : "Bu alan için bilgi girilmemiş."}
            </p>
        </section>
    );
};

type Props = {
    job: JobPosting;
    onClose: () => void;
};

const JobPostingDetailModal = ({ job, onClose }: Props) => {
    return (
        <div
            className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-sky-400/25 bg-[#020817]/95 shadow-[0_0_80px_rgba(14,165,233,0.18)] backdrop-blur-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative shrink-0 overflow-hidden border-b border-white/10 px-7 py-6">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(124,58,237,0.14),transparent_35%)]" />

                    <div className="relative flex items-start justify-between gap-5">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-300 shadow-[0_0_30px_rgba(14,165,233,0.22)]">
                                <BriefcaseBusiness className="h-7 w-7" />
                            </div>

                            <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <StatusBadge status={job.status} />

                                    <SmallPill
                                        icon={<CalendarDays className="h-3.5 w-3.5" />}
                                        color="cyan"
                                    >
                                        Son başvuru: {formatDate(job.applicationDeadline)}
                                    </SmallPill>
                                </div>

                                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                                    {job.title}
                                </h2>

                                <p className="mt-2 text-sm text-slate-400">
                                    İlan bilgilerini görüntüleyin.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="relative rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="staffly-scroll min-h-0 flex-1 overflow-y-auto px-7 py-6">
                    <div className="mb-6 rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-950/60 to-slate-950/90 p-6">
                        <div className="flex flex-wrap gap-3">
                            <SmallPill icon={<Building2 className="h-3.5 w-3.5" />}>
                                {job.departmentName || "Departman yok"} /{" "}
                                {job.subDepartmentName || "Alt departman yok"}
                            </SmallPill>

                            <SmallPill
                                icon={<BriefcaseBusiness className="h-3.5 w-3.5" />}
                                color="violet"
                            >
                                {job.positionName || "Pozisyon yok"}
                            </SmallPill>

                            <SmallPill icon={<MapPin className="h-3.5 w-3.5" />} color="cyan">
                                {job.location || "Konum belirtilmedi"}
                            </SmallPill>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <SummaryCard
                                icon={<Clock3 className="h-5 w-5" />}
                                label="Çalışma Tipi"
                                value={
                                    employmentTypeMap[job.employmentType || ""] ||
                                    "Belirtilmedi"
                                }
                                color="blue"
                            />

                            <SummaryCard
                                icon={<Layers3 className="h-5 w-5" />}
                                label="Çalışma Modeli"
                                value={workModelMap[job.workModel || ""] || "Belirtilmedi"}
                                color="violet"
                            />

                            <SummaryCard
                                icon={<Sparkles className="h-5 w-5" />}
                                label="Tecrübe"
                                value={job.experienceLevel || "Belirtilmedi"}
                                color="amber"
                            />

                            <SummaryCard
                                icon={<BadgeCheck className="h-5 w-5" />}
                                label="Durum"
                                value={
                                    job.status === "ACTIVE"
                                        ? "Aktif"
                                        : job.status === "DRAFT"
                                            ? "Taslak"
                                            : "Kapalı"
                                }
                                color="emerald"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <DetailSection
                            title="İlan Açıklaması"
                            value={job.description}
                            icon={<FileText className="h-4 w-4" />}
                        />

                        <DetailSection
                            title="Beklenenler"
                            value={job.requirements}
                            icon={<Sparkles className="h-4 w-4" />}
                        />

                        <DetailSection
                            title="Sorumluluklar"
                            value={job.responsibilities}
                            icon={<BriefcaseBusiness className="h-4 w-4" />}
                        />

                        <DetailSection
                            title="Yan Haklar"
                            value={job.benefits}
                            icon={<BadgeCheck className="h-4 w-4" />}
                        />

                        <DetailSection
                            title="Ekip Bilgisi"
                            value={job.teamInfo}
                            icon={<UsersRound className="h-4 w-4" />}
                        />
                    </div>
                </div>

                <div className="shrink-0 border-t border-white/10 bg-slate-950/80 px-7 py-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-sm font-bold text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobPostingDetailModal;