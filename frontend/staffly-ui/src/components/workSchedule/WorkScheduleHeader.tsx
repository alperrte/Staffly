import {
    Building2,
    CalendarClock,
    Clock3,
    LayoutGrid,
} from "lucide-react";

export type WorkScheduleTab = "department-hours" | "weekly-plan" | "overtime";

type Props = {
    activeTab: WorkScheduleTab;
    departmentCount: number;
    activeScheduleCount: number;
    overtimeCount: number;
    onTabChange: (tab: WorkScheduleTab) => void;
};

const WorkScheduleHeader = ({
                                activeTab,
                                departmentCount,
                                activeScheduleCount,
                                overtimeCount,
                                onTabChange,
                            }: Props) => {
    return (
        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_0_55px_rgba(15,23,42,0.75)]">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div>

                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                        Çalışma Takvimi Yönetimi
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                        Departman çalışma saatlerini, haftalık çalışma planlarını ve ek mesai süreçlerini kurumsal olarak yönetin.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                    <HeaderStatCard
                        icon={<Building2 className="h-6 w-6" />}
                        value={departmentCount}
                        title="Departman"
                        description="Toplam departman"
                        color="violet"
                    />

                    <HeaderStatCard
                        icon={<Clock3 className="h-6 w-6" />}
                        value={activeScheduleCount}
                        title="Aktif Saat"
                        description="Çalışan aktif saat"
                        color="emerald"
                    />

                    <HeaderStatCard
                        icon={<CalendarClock className="h-6 w-6" />}
                        value={overtimeCount}
                        title="Ek Mesai"
                        description="Bu ay ek mesai"
                        color="amber"
                    />
                </div>
            </div>

            <div className="mt-7 border-t border-white/10 pt-5">
                <div className="flex flex-wrap gap-3">
                    <HeaderTabButton
                        active={activeTab === "department-hours"}
                        icon={<Building2 className="h-4 w-4" />}
                        label="Departmanların Çalışma Saatleri"
                        onClick={() => onTabChange("department-hours")}
                    />

                    <HeaderTabButton
                        active={activeTab === "weekly-plan"}
                        icon={<LayoutGrid className="h-4 w-4" />}
                        label="Haftalık Çalışma Planı"
                        onClick={() => onTabChange("weekly-plan")}
                    />

                    <HeaderTabButton
                        active={activeTab === "overtime"}
                        icon={<CalendarClock className="h-4 w-4" />}
                        label="Ek Mesai Planlama"
                        onClick={() => onTabChange("overtime")}
                    />
                </div>
            </div>
        </section>
    );
};

const HeaderStatCard = ({
                            icon,
                            value,
                            title,
                            description,
                            color,
                        }: {
    icon: React.ReactNode;
    value: number;
    title: string;
    description: string;
    color: "violet" | "emerald" | "amber";
}) => {
    const colorClass =
        color === "violet"
            ? "bg-violet-500/15 text-violet-300 shadow-[0_0_26px_rgba(139,92,246,0.2)]"
            : color === "emerald"
                ? "bg-emerald-500/15 text-emerald-300 shadow-[0_0_26px_rgba(16,185,129,0.18)]"
                : "bg-amber-500/15 text-amber-300 shadow-[0_0_26px_rgba(245,158,11,0.16)]";

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/45 p-4">
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}>
                    {icon}
                </div>

                <div>
                    <p className="text-2xl font-extrabold text-white">{value}</p>
                    <p className="text-sm font-bold text-slate-200">{title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                </div>
            </div>
        </div>
    );
};

const HeaderTabButton = ({
                             active,
                             icon,
                             label,
                             onClick,
                         }: {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex min-h-[48px] items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                active
                    ? "border-transparent bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 text-white shadow-[0_14px_35px_rgba(37,99,235,0.35)]"
                    : "border-white/10 bg-slate-950/70 text-slate-400 hover:border-blue-400/35 hover:bg-blue-500/10 hover:text-white"
            }`}
        >
            {icon}
            {label}
        </button>
    );
};

export default WorkScheduleHeader;