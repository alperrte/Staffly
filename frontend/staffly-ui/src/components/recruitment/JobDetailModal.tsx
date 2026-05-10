import {
    ArrowRight,
    BriefcaseBusiness,
    Calendar,
    CheckCircle2,
    Clock3,
    MapPin,
    Star,
    TrendingUp,
    X,
} from "lucide-react";
import type { JobPosting } from "../../types/loginPageTypes";

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

const splitLines = (text?: string) => {
    if (!text?.trim()) return [];

    return text
        .split(/\n|•|-/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};

const JobDetailModal = ({
                            job,
                            onClose,
                            onApply,
                        }: {
    job: JobPosting;
    onClose: () => void;
    onApply: () => void;
}) => {
    const requirements = splitLines(job.requirements);
    const responsibilities = splitLines(job.responsibilities);

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-blue-400/35 bg-[#030817]/95 shadow-[0_0_70px_rgba(37,99,235,0.28)] backdrop-blur-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-7 py-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 shadow-[0_0_28px_rgba(37,99,235,0.35)]">
                        <BriefcaseBusiness className="h-7 w-7" />
                    </div>

                    <h2 className="text-xl font-bold text-white">
                        İlan Detayı
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <div className="staffly-scroll min-h-0 flex-1 overflow-y-auto px-7 py-7">
                <div className="flex flex-col gap-5 border-b border-white/10 pb-7 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">
                            {job.title}
                        </h1>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                            <span>{job.departmentName}</span>
                            <span className="text-slate-600">•</span>
                            <span>{job.subDepartmentName}</span>

                            {job.location && (
                                <span className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-300" />
                                    {job.location}
                                </span>
                            )}

                            <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
                            {employmentTypeMap[job.employmentType || ""] || job.employmentType || "Belirtilmedi"}
                            </span>

                            <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
                            {workModelMap[job.workModel || ""] || job.workModel || "Belirtilmedi"}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/55 px-5 py-4 text-sm text-slate-300 shadow-[0_0_25px_rgba(15,23,42,0.45)]">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Clock3 className="h-4 w-4" />
                            Son başvuru
                        </div>

                        <p className="mt-1 font-bold text-white">
                            {formatDate(job.applicationDeadline)}
                        </p>
                    </div>
                </div>

                <div className="mt-7">
                    <h3 className="text-lg font-bold text-white">İlan Özeti</h3>

                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {job.description || "Bu pozisyon için ilan açıklaması girilmemiş."}
                    </p>
                </div>

                {responsibilities.length > 0 && (
                    <div className="mt-7">
                        <h3 className="text-lg font-bold text-white">İş Tanımı</h3>

                        <ul className="mt-4 space-y-2">
                            {responsibilities.map((item, index) => (
                                <li
                                    key={`${item}-${index}`}
                                    className="flex gap-3 text-sm leading-6 text-slate-300"
                                >
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {requirements.length > 0 && (
                    <div className="mt-7">
                        <h3 className="text-lg font-bold text-white">
                            Aranan Nitelikler
                        </h3>

                        <ul className="mt-4 space-y-2">
                            {requirements.map((item, index) => (
                                <li
                                    key={`${item}-${index}`}
                                    className="flex items-start gap-3 text-sm leading-6 text-slate-300"
                                >
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoBox
                        icon={<Clock3 className="h-5 w-5" />}
                        label="Çalışma Modeli"
                        value={workModelMap[job.workModel || ""] || job.workModel || "Belirtilmedi"}
                        color="blue"
                    />

                    <InfoBox
                        icon={<Star className="h-5 w-5" />}
                        label="Çalışma Tipi"
                        value={employmentTypeMap[job.employmentType || ""] || job.employmentType || "Belirtilmedi"}
                        color="amber"
                    />

                    <InfoBox
                        icon={<TrendingUp className="h-5 w-5" />}
                        label="Deneyim"
                        value={job.experienceLevel || "Belirtilmedi"}
                        color="emerald"
                    />

                    <InfoBox
                        icon={<Calendar className="h-5 w-5" />}
                        label="İlan Yayınlanma"
                        value={formatDate(job.createdAt)}
                        color="purple"
                    />
                </div>
            </div>

            <div className="shrink-0 border-t border-white/10 px-7 py-6">
                <button
                    type="button"
                    onClick={onApply}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 py-4 text-base font-bold text-white shadow-[0_20px_45px_rgba(37,99,235,0.45)] transition hover:scale-[1.01] hover:opacity-95"
                >
                    Başvur
                    <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </section>
    );
};

const InfoBox = ({
                     icon,
                     label,
                     value,
                     color,
                 }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: "blue" | "amber" | "emerald" | "purple";
}) => {
    const colors = {
        blue: "bg-blue-500/15 text-blue-300 shadow-[0_0_22px_rgba(37,99,235,0.22)]",
        amber: "bg-amber-500/15 text-amber-300 shadow-[0_0_22px_rgba(245,158,11,0.16)]",
        emerald: "bg-emerald-500/15 text-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.16)]",
        purple: "bg-violet-500/15 text-violet-300 shadow-[0_0_22px_rgba(124,58,237,0.2)]",
    };

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/45 p-4 shadow-[0_0_25px_rgba(15,23,42,0.4)]">
            <div className="flex items-center gap-3">
                <div className={`rounded-xl p-3 ${colors[color]}`}>
                    {icon}
                </div>

                <div className="min-w-0">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="mt-1 text-sm font-bold text-white">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JobDetailModal;