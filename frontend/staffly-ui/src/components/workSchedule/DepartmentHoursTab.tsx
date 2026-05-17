import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
    BriefcaseBusiness,
    Building2,
    Clock3,
    MoreHorizontal,
    Pencil,
    Search,
    Trash2,
} from "lucide-react";

import type {
    DepartmentResponse,
    DepartmentWorkScheduleResponse,
} from "../../types/workScheduleTypes";

type Props = {
    departments: DepartmentResponse[];
    schedules: DepartmentWorkScheduleResponse[];
    getDepartmentName: (departmentId?: number | null) => string;
    onCreate: () => void;
    onEdit: (item: DepartmentWorkScheduleResponse) => void;
    onDelete: (item: DepartmentWorkScheduleResponse) => void;
};

const DepartmentHoursTab = ({
                                departments,
                                schedules,
                                getDepartmentName,
                                onCreate,
                                onEdit,
                                onDelete,
                            }: Props) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [actionMenu, setActionMenu] = useState<{
        item: DepartmentWorkScheduleResponse;
        top: number;
        left: number;
    } | null>(null);

    const filteredSchedules = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        if (!search) return schedules;

        return schedules.filter((item) =>
            getDepartmentName(item.departmentId).toLowerCase().includes(search)
        );
    }, [schedules, searchTerm, getDepartmentName]);

    useEffect(() => {
        if (filteredSchedules.length === 0) {
            setSelectedId(null);
            return;
        }

        if (!selectedId || !filteredSchedules.some((item) => item.id === selectedId)) {
            setSelectedId(filteredSchedules[0].id);
        }
    }, [filteredSchedules, selectedId]);

    useEffect(() => {
        if (!actionMenu) return;

        const closeMenu = () => {
            setActionMenu(null);
        };

        window.addEventListener("click", closeMenu);
        window.addEventListener("resize", closeMenu);
        window.addEventListener("scroll", closeMenu, true);

        return () => {
            window.removeEventListener("click", closeMenu);
            window.removeEventListener("resize", closeMenu);
            window.removeEventListener("scroll", closeMenu, true);
        };
    }, [actionMenu]);

    const selectedSchedule =
        filteredSchedules.find((item) => item.id === selectedId) || filteredSchedules[0];

    const getEmployeeCount = (departmentId: number) => {
        const department = departments.find((item) => item.id === departmentId);
        const maybeCount = department as DepartmentResponse & { employeeCount?: number };
        return maybeCount.employeeCount ?? 0;
    };

    const handleActionMenuToggle = (
        event: React.MouseEvent<HTMLButtonElement>,
        item: DepartmentWorkScheduleResponse
    ) => {
        event.stopPropagation();

        if (actionMenu?.item.id === item.id) {
            setActionMenu(null);
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const menuWidth = 176;
        const gap = 8;

        const left = Math.min(
            Math.max(16, rect.right - menuWidth),
            window.innerWidth - menuWidth - 16
        );

        const top = Math.min(rect.bottom + gap, window.innerHeight - 120);

        setActionMenu({
            item,
            top,
            left,
        });
    };

    return (
        <>
            <div className="grid min-h-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_430px]">
                <section className="flex min-h-0 flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-5 shadow-[0_0_45px_rgba(15,23,42,0.65)]">
                    <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-white">
                                Departmanların Çalışma Saatleri
                            </h2>
                            <p className="mt-1 text-sm text-slate-400">
                                Her departman için aktif standart çalışma saatini tanımla.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="flex h-12 min-w-[320px] items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 px-4">
                                <Search className="h-5 w-5 text-slate-500" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Departman ara..."
                                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={onCreate}
                                className="rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_35px_rgba(37,99,235,0.35)] transition hover:opacity-90"
                            >
                                + Çalışma Saati Ata
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-white/10">
                        <table className="w-full min-w-[760px]">
                            <thead>
                            <tr className="border-b border-white/10 bg-slate-900/70 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                                <th className="px-5 py-4">Departman</th>
                                <th className="px-5 py-4">Çalışma Saati</th>
                                <th className="px-5 py-4">Mola</th>
                                <th className="px-5 py-4">Durum</th>
                                <th className="px-5 py-4 text-right">İşlemler</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredSchedules.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-5 py-16 text-center text-sm text-slate-500"
                                    >
                                        Departman çalışma saati bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                filteredSchedules.map((item) => {
                                    const selected = selectedSchedule?.id === item.id;

                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedId(item.id)}
                                            className={`cursor-pointer border-b border-white/10 text-sm transition ${
                                                selected
                                                    ? "bg-blue-500/10 outline outline-1 outline-blue-500/60"
                                                    : "hover:bg-slate-900/55"
                                            }`}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/15 text-blue-300">
                                                        <Building2 className="h-6 w-6" />
                                                    </div>

                                                    <div>
                                                        <p className="font-bold text-white">
                                                            {getDepartmentName(item.departmentId)}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {getEmployeeCount(item.departmentId)} çalışan
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-white">
                                                    {item.startTime.slice(0, 5)} -{" "}
                                                    {item.endTime.slice(0, 5)}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Pzt - Cum
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-white">
                                                    {item.breakStartTime && item.breakEndTime
                                                        ? `${item.breakStartTime.slice(
                                                            0,
                                                            5
                                                        )} - ${item.breakEndTime.slice(0, 5)}`
                                                        : "-"}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">
                                                    Öğle arası
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusBadge active={item.active} />
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            handleActionMenuToggle(e, item)
                                                        }
                                                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-900 text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-blue-300"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                        <span>Toplam {filteredSchedules.length} departman</span>
                        <span>5 / sayfa</span>
                    </div>
                </section>

                <aside className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-6 shadow-[0_0_45px_rgba(15,23,42,0.65)]">
                    {selectedSchedule ? (
                        <>
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-blue-400/25 bg-blue-500/15 text-blue-300">
                                        <Building2 className="h-8 w-8" />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-extrabold text-white">
                                                {getDepartmentName(selectedSchedule.departmentId)}
                                            </h3>
                                            <StatusBadge active={selectedSchedule.active} />
                                        </div>
                                        <p className="mt-1 text-sm text-slate-400">
                                            {getEmployeeCount(selectedSchedule.departmentId)} çalışan
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-white/10 pb-4">
                                <button className="border-b-2 border-blue-400 pb-3 text-sm font-bold text-blue-300">
                                    Çalışma Saati
                                </button>
                            </div>

                            <div className="mt-5 space-y-5">
                                <DetailRow
                                    icon={<Clock3 className="h-5 w-5" />}
                                    label="Çalışma Saatleri"
                                    value={`${selectedSchedule.startTime.slice(
                                        0,
                                        5
                                    )} - ${selectedSchedule.endTime.slice(0, 5)}`}
                                />

                                <DetailRow
                                    icon={<BriefcaseBusiness className="h-5 w-5" />}
                                    label="Çalışma Günleri"
                                    value="Pazartesi - Cuma"
                                />

                                <DetailRow
                                    icon={<Clock3 className="h-5 w-5" />}
                                    label="Mola Saati"
                                    value={
                                        selectedSchedule.breakStartTime &&
                                        selectedSchedule.breakEndTime
                                            ? `${selectedSchedule.breakStartTime.slice(
                                                0,
                                                5
                                            )} - ${selectedSchedule.breakEndTime.slice(0, 5)}`
                                            : "-"
                                    }
                                />
                            </div>

                            <div className="mt-8">
                                <button
                                    type="button"
                                    onClick={() => onEdit(selectedSchedule)}
                                    className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 px-4 py-3 text-sm font-bold text-white"
                                >
                                    Düzenle
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full min-h-[360px] items-center justify-center text-center text-slate-500">
                            Departman seçiniz.
                        </div>
                    )}
                </aside>
            </div>

            {actionMenu &&
                createPortal(
                    <div
                        style={{
                            top: actionMenu.top,
                            left: actionMenu.left,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="fixed z-[13000] w-44 overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
                    >
                        <button
                            type="button"
                            onClick={() => {
                                const selectedItem = actionMenu.item;
                                setActionMenu(null);
                                onEdit(selectedItem);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-blue-500/10 hover:text-blue-300"
                        >
                            <Pencil className="h-4 w-4" />
                            Düzenle
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const selectedItem = actionMenu.item;
                                setActionMenu(null);
                                onDelete(selectedItem);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                        >
                            <Trash2 className="h-4 w-4" />
                            Sil
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
};

const StatusBadge = ({ active }: { active?: boolean }) => {
    return active ? (
        <span className="inline-flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Aktif
        </span>
    ) : (
        <span className="inline-flex items-center gap-2 rounded-lg border border-slate-400/20 bg-slate-500/15 px-3 py-1 text-xs font-bold text-slate-300">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Pasif
        </span>
    );
};

const DetailRow = ({
                       icon,
                       label,
                       value,
                   }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) => {
    return (
        <div className="flex items-center justify-between gap-5 text-sm">
            <div className="flex items-center gap-3 text-slate-400">
                {icon}
                <span>{label}</span>
            </div>
            <span className="font-bold text-white">{value}</span>
        </div>
    );
};

export default DepartmentHoursTab;