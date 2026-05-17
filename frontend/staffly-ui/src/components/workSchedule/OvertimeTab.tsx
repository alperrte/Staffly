import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
    CheckCircle2,
    Clock3,
    FileText,
    Plus,
    Search,
    XCircle,
} from "lucide-react";

import type {
    DepartmentResponse,
    OvertimeResponse,
} from "../../types/workScheduleTypes";

type OvertimeFilter = {
    departmentId: string;
};

type Props = {
    departments: DepartmentResponse[];
    overtimes: OvertimeResponse[];
    overtimeFilter: OvertimeFilter;
    setOvertimeFilter: Dispatch<SetStateAction<OvertimeFilter>>;
    getEmployeeName: (employeeId: number) => string;
    onCreateEmployeeOvertime: () => void;
    onEdit: (overtime: OvertimeResponse) => void;
    onCancel: (id: number) => void;
};

const overtimeStatusLabels: Record<string, string> = {
    PLANNED: "Planlandı",
    UPDATED: "Güncellendi",
    CANCELLED: "İptal Edildi",
    COMPLETED: "Tamamlandı",
};

const OvertimeTab = ({
                         departments,
                         overtimes,
                         overtimeFilter,
                         setOvertimeFilter,
                         getEmployeeName,
                         onCreateEmployeeOvertime,
                         onEdit,
                         onCancel,
                     }: Props) => {
    const [searchTerm, setSearchTerm] = useState("");

    const total = overtimes.length;
    const completed = overtimes.filter((item) => item.status === "COMPLETED").length;
    const planned = overtimes.filter(
        (item) => item.status === "PLANNED" || item.status === "UPDATED"
    ).length;
    const cancelled = overtimes.filter((item) => item.status === "CANCELLED").length;

    const getDepartmentName = (departmentId?: number | null) => {
        if (!departmentId) return "Departman yok";

        return (
            departments.find((department) => department.id === departmentId)?.name ||
            `Departman #${departmentId}`
        );
    };

    const filteredOvertimes = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        if (!normalizedSearch) return overtimes;

        return overtimes.filter((overtime) =>
            getEmployeeName(overtime.employeeId)
                .toLowerCase()
                .includes(normalizedSearch)
        );
    }, [overtimes, searchTerm, getEmployeeName]);

    return (
        <div className="space-y-5">
            <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-5 shadow-[0_0_45px_rgba(15,23,42,0.65)]">
                <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-white">
                            Ek Mesai Yönetimi
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Çalışanlara normal çalışma saatleri dışında ek mesai ata.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCreateEmployeeOvertime}
                        className="rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.35)] transition hover:opacity-90"
                    >
                        <Plus className="mr-2 inline h-4 w-4" />
                        Çalışana Ek Mesai Ata
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <StatCard icon={<Clock3 className="h-6 w-6" />} label="Toplam Ek Mesai" value={`${total} Kayıt`} color="blue" />
                    <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label="Tamamlanan" value={`${completed} Kayıt`} color="emerald" />
                    <StatCard icon={<Clock3 className="h-6 w-6" />} label="Planlanan" value={`${planned} Kayıt`} color="amber" />
                    <StatCard icon={<XCircle className="h-6 w-6" />} label="İptal Edilen" value={`${cancelled} Kayıt`} color="rose" />
                </div>
            </section>

            <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-5 shadow-[0_0_45px_rgba(15,23,42,0.65)]">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-white">Ek Mesai Kayıtları</h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Çalışan araması yapabilir veya departmana göre filtreleyebilirsin.
                        </p>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-3 lg:max-w-2xl lg:grid-cols-[minmax(0,1fr)_240px]">
                        <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-4">
                            <Search className="h-5 w-5 text-slate-500" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Çalışan ara..."
                                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                            />
                        </div>

                        <select
                            className="h-12 rounded-xl border border-white/10 bg-slate-950/80 px-4 text-sm font-semibold text-white outline-none focus:border-blue-400 [&>option]:bg-slate-950"
                            value={overtimeFilter.departmentId}
                            onChange={(e) =>
                                setOvertimeFilter((prev) => ({
                                    ...prev,
                                    departmentId: e.target.value,
                                }))
                            }
                        >
                            <option value="">Tüm departmanlar</option>
                            {departments.map((department) => (
                                <option key={department.id} value={department.id}>
                                    {department.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                            <tr className="border-b border-white/10 bg-slate-900/70 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                <th className="px-5 py-4">Çalışan</th>
                                <th className="px-5 py-4">Departman</th>
                                <th className="px-5 py-4">Tarih</th>
                                <th className="px-5 py-4">Başlangıç</th>
                                <th className="px-5 py-4">Bitiş</th>
                                <th className="px-5 py-4">Durum</th>
                                <th className="px-5 py-4 text-right">İşlemler</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredOvertimes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-20 text-center">
                                        <FileText className="mx-auto mb-4 h-14 w-14 text-slate-700" />
                                        <p className="font-bold text-white">Henüz ek mesai kaydı bulunmuyor</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Kayıtlar oluşturulduğunda burada listelenecek.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOvertimes.map((overtime) => (
                                    <tr key={overtime.id} className="border-b border-white/10 text-sm text-slate-300 transition hover:bg-slate-900/55">
                                        <td className="px-5 py-4 font-bold text-white">{getEmployeeName(overtime.employeeId)}</td>
                                        <td className="px-5 py-4">{getDepartmentName(overtime.departmentId)}</td>
                                        <td className="px-5 py-4">{overtime.overtimeDate}</td>
                                        <td className="px-5 py-4">{overtime.startTime?.slice(0, 5) || "-"}</td>
                                        <td className="px-5 py-4">{overtime.endTime?.slice(0, 5) || "-"}</td>
                                        <td className="px-5 py-4"><StatusBadge status={overtime.status} /></td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => onEdit(overtime)} className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300">
                                                    Düzenle
                                                </button>
                                                {overtime.status !== "CANCELLED" && (
                                                    <button type="button" onClick={() => onCancel(overtime.id)} className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20">
                                                        İptal
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-5 text-sm text-slate-400">Toplam {filteredOvertimes.length} kayıt</div>
            </section>
        </div>
    );
};

const StatCard = ({
                      icon,
                      label,
                      value,
                      color,
                  }: {
    icon: ReactNode;
    label: string;
    value: string;
    color: "blue" | "emerald" | "amber" | "rose";
}) => {
    const colorClass =
        color === "emerald"
            ? "bg-emerald-500/15 text-emerald-300"
            : color === "amber"
                ? "bg-amber-500/15 text-amber-300"
                : color === "rose"
                    ? "bg-rose-500/15 text-rose-300"
                    : "bg-blue-500/15 text-blue-300";

    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/45 p-4">
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClass}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-slate-400">{label}</p>
                    <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    if (status === "COMPLETED") {
        return <span className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">Tamamlandı</span>;
    }
    if (status === "CANCELLED") {
        return <span className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300">İptal</span>;
    }
    if (status === "UPDATED") {
        return <span className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">Güncellendi</span>;
    }
    return <span className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">{overtimeStatusLabels[status] || status}</span>;
};

export default OvertimeTab;
