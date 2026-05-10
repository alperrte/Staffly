import {
    BriefcaseBusiness,
    ChevronRight,
    Code2,
    MapPin,
} from "lucide-react";
import type { JobPosting } from "../../types/loginPageTypes";

const employmentTypeMap: Record<string, string> = {
    FULL_TIME: "Tam Zamanlı",
    PART_TIME: "Yarı Zamanlı",
    INTERNSHIP: "Staj",
    CONTRACT: "Sözleşmeli",
};

const JobPostingCard = ({
                            job,
                            onClick,
                            index,
                        }: {
    job: JobPosting;
    onClick: () => void;
    index: number;
}) => {
    const colors = [
        "from-violet-600 to-indigo-500 text-violet-100",
        "from-blue-600 to-sky-500 text-blue-100",
        "from-emerald-600 to-green-500 text-emerald-100",
    ];

    const employmentTypeLabel =
        employmentTypeMap[job.employmentType || ""] || job.employmentType || "Belirtilmedi";


    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/35 p-5 text-left transition hover:border-sky-400/50 hover:bg-slate-900/65"
        >
            <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${
                    colors[index % colors.length]
                } shadow-[0_0_25px_rgba(37,99,235,0.25)]`}
            >
                {index % 2 === 0 ? (
                    <Code2 className="h-6 w-6" />
                ) : (
                    <BriefcaseBusiness className="h-6 w-6" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-base font-bold text-white">
                    {job.title}
                </p>

                <p className="mt-1 truncate text-sm text-slate-400">
                    {job.departmentName} / {job.positionName}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                    {job.location && (
                        <span className="flex items-center gap-1.5">
                     <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                </span>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="rounded-xl bg-blue-500/15 px-3 py-1 text-sm font-semibold text-blue-300">
                    Yeni
                </span>

                <span className="rounded-xl bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
                    {employmentTypeLabel}
                </span>
            </div>

            <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-sky-300" />
        </button>
    );
};

export default JobPostingCard;