import { useEffect, useMemo, useState } from "react";
import {
    BriefcaseBusiness,
    Building2,
    Check,
    Clock3,
    Hash,
    Mail,
    MessageSquareText,
    Phone,
    RefreshCw,
    Search,
    UserRound,
    WalletCards,
    X,
} from "lucide-react";
import { getAllEmployees } from "../../services/employeeService";
import {
    approveAdvance,
    getPendingAdvanceRequests,
    rejectAdvance,
    type AdvanceRecord,
} from "../../services/payrollService";
import type { NormalizedEmployee } from "../../types/employeeTypes";
import ConfirmModal from "../../components/common/ConfirmModal";



const money = (value: string | number | null | undefined) => {
    if (value == null) return "-";
    const amount = Number(value);
    if (!Number.isFinite(amount)) return String(value);
    return amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
};

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("tr-TR");
};

const panelClass = "rounded-[26px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_34px_rgba(15,23,42,0.35)]";

const AdvanceRequestsPage = () => {
    const [rows, setRows] = useState<AdvanceRecord[]>([]);
    const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [employeeLoadError, setEmployeeLoadError] = useState("");
    const [message, setMessage] = useState("");
    const [query, setQuery] = useState("");
    const [actionId, setActionId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReasonById, setRejectReasonById] = useState<Record<number, string>>({});
    const [confirmAction, setConfirmAction] = useState<{
        type: "APPROVE" | "REJECT";
        row: AdvanceRecord;
    } | null>(null);


    const employeeById = useMemo(() => {
        const map = new Map<number, NormalizedEmployee>();

        employees.forEach((employee) => {
            if (employee.id != null) {
                map.set(Number(employee.id), employee);
            }

            const employeeCode = employee.basicInfo?.employeeCode;
            const numericEmployeeCode = Number(String(employeeCode || "").replace(/\D/g, ""));

            if (Number.isFinite(numericEmployeeCode) && numericEmployeeCode > 0) {
                map.set(numericEmployeeCode, employee);
            }
        });

        return map;
    }, [employees]);

    const totalAmount = useMemo(
        () => rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
        [rows]
    );

    const filteredRows = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return rows;

        return rows.filter((row) => {
            const employee = employeeById.get(row.employeeId);
            return [
                row.id,
                row.employeeId,
                employee?.basicInfo?.fullName,
                employee?.basicInfo?.employeeCode,
                employee?.contactInfo?.email,
                employee?.contactInfo?.phone,
                employee?.organizationInfo?.departmentName,
                employee?.organizationInfo?.positionName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(term);
        });
    }, [employeeById, query, rows]);

    const load = async () => {
        try {
            setLoading(true);
            setError("");
            setEmployeeLoadError("");

            const [advanceRows, employeeResult] = await Promise.all([
                getPendingAdvanceRequests(),
                getAllEmployees()
                    .then((data) => ({ data, failed: false }))
                    .catch((err) => {
                        console.error(err);
                        return { data: [], failed: true };
                    }),
            ]);

            setRows(advanceRows);
            setEmployees(Array.isArray(employeeResult.data) ? employeeResult.data : []);

            if (employeeResult.failed) {
                setEmployeeLoadError("Çalışan bilgileri yüklenemedi. Talepler çalışan adı olmadan gösteriliyor.");
            }
        } catch (err) {
            console.error(err);
            setError("Avans talepleri yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const getEmployeeName = (employeeId: number) => {
        const employee = employeeById.get(employeeId);

        return employee?.basicInfo?.fullName || `Çalışan #${employeeId}`;
    };

    const openApproveConfirm = (row: AdvanceRecord) => {
        setConfirmAction({
            type: "APPROVE",
            row,
        });
    };

    const openRejectConfirm = (row: AdvanceRecord) => {
        const reason = (rejectReasonById[row.id] || "").trim();

        if (!reason) {
            setRejectingId(row.id);
            setError("Red işlemi için açıklama zorunludur.");
            return;
        }

        setConfirmAction({
            type: "REJECT",
            row,
        });
    };

    const closeConfirmModal = () => {
        if (actionId != null) return;
        setConfirmAction(null);
    };

    const confirmSelectedAction = async () => {
        if (!confirmAction) return;

        if (confirmAction.type === "APPROVE") {
            await onApprove(confirmAction.row.id);
        } else {
            await onReject(confirmAction.row.id);
        }

        setConfirmAction(null);
    };

    const onApprove = async (id: number) => {
        try {
            setActionId(id);
            setError("");
            setMessage("");
            await approveAdvance(id);
            setMessage(`#${id} numaralı avans talebi onaylandı.`);
            await load();
        } catch (err) {
            console.error(err);
            setError("Avans onaylanamadı.");
        } finally {
            setActionId(null);
        }
    };

    const onReject = async (id: number) => {
        const reason = (rejectReasonById[id] || "").trim();
        if (!reason) {
            setError("Red işlemi için açıklama zorunludur.");
            return;
        }

        try {
            setActionId(id);
            setError("");
            setMessage("");
            await rejectAdvance(id, { reason });
            setMessage(`#${id} numaralı avans talebi reddedildi.`);
            setRejectingId(null);
            await load();
        } catch (err) {
            console.error(err);
            setError("Avans reddedilemedi.");
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="min-h-full w-full px-5 py-5 text-slate-100 sm:px-6 lg:px-8">
            <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Avans Talepleri</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                        Bekleyen talepleri inceleyin, uygun olanları onaylayın veya çalışan için cevap niteliğinde bir red açıklaması girin.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={load}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-500/10"
                >
                    <RefreshCw className="h-4 w-4" />
                    Yenile
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className={panelClass}>
                    <div className="text-sm text-slate-400">Bekleyen talep</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{rows.length}</div>
                </div>
                <div className={panelClass}>
                    <div className="text-sm text-slate-400">Toplam tutar</div>
                    <div className="mt-2 text-3xl font-semibold text-white">{money(totalAmount)}</div>
                </div>
                <div className={panelClass}>
                    <div className="text-sm text-slate-400">Aksiyon bekleyen</div>
                    <div className="mt-2 flex items-center gap-2 text-3xl font-semibold text-white">
                        <Clock3 className="h-7 w-7 text-amber-300" />
                        {filteredRows.length}
                    </div>
                </div>
            </div>

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            {employeeLoadError && <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{employeeLoadError}</div>}
            {message && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

            <section className={panelClass}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white">Bekleyen Talepler</h2>
                    <div className="relative w-full sm:w-80">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                            placeholder="Çalışan veya talep ara"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">Yükleniyor...</div>
                ) : filteredRows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">Bekleyen avans talebi yok.</div>
                ) : (
                    <div className="grid gap-3">
                        {filteredRows.map((row) => {
                            const employee = employeeById.get(row.employeeId);
                            const reason = rejectReasonById[row.id] || "";
                            const isBusy = actionId === row.id;

                            return (
                                <article
                                    key={row.id}
                                    className="group overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-950/55 to-slate-900/45 shadow-[0_18px_55px_rgba(2,6,23,0.42)] transition hover:border-sky-400/25 hover:bg-white/[0.045]"
                                >
                                    <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-stretch xl:justify-between">
                                        <div className="flex min-w-0 flex-1 gap-4">
                                            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-200 shadow-[0_0_28px_rgba(14,165,233,0.14)] sm:flex">
                                                <UserRound className="h-7 w-7" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                        <Hash className="h-3.5 w-3.5" />
                        Talep #{row.id}
                    </span>

                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
                        <Clock3 className="h-3.5 w-3.5" />
                                                        {formatDate(row.requestDate || row.createdAt)}
                    </span>
                                                </div>

                                                <h3 className="mt-3 truncate text-xl font-bold tracking-tight text-white">
                                                    {employee?.basicInfo?.fullName || "Çalışan bilgisi bulunamadı"}
                                                </h3>

                                                <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 2xl:grid-cols-4">

                                                    {employee?.contactInfo?.email && (
                                                        <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
                                                            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                                                            <div className="min-w-0">
                                                                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                                    E-posta
                                                                </div>
                                                                <div className="truncate text-xs font-semibold text-slate-300">
                                                                    {employee.contactInfo.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {employee?.contactInfo?.phone && (
                                                        <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-2.5">
                                                            <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                                                            <div className="min-w-0">
                                                                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                                    Telefon
                                                                </div>
                                                                <div className="truncate text-xs font-semibold text-slate-300">
                                                                    {employee.contactInfo.phone}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {employee?.organizationInfo?.departmentName && (
                                                        <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-3 py-2.5">
                                                            <Building2 className="h-4 w-4 shrink-0 text-sky-300" />
                                                            <div className="min-w-0">
                                                                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300/70">
                                                                    Departman
                                                                </div>
                                                                <div className="truncate text-xs font-semibold text-sky-100">
                                                                    {employee.organizationInfo.departmentName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {employee?.organizationInfo?.positionName && (
                                                        <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-purple-400/20 bg-purple-500/10 px-3 py-2.5 md:col-span-2 2xl:col-span-1">
                                                            <BriefcaseBusiness className="h-4 w-4 shrink-0 text-purple-300" />
                                                            <div className="min-w-0">
                                                                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-purple-300/70">
                                                                    Pozisyon
                                                                </div>
                                                                <div className="truncate text-xs font-semibold text-purple-100">
                                                                    {employee.organizationInfo.positionName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!employee && (
                                                        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-3 py-2.5 text-xs font-semibold text-amber-200">
                                                            Çalışan eşleşmedi: #{row.employeeId}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col justify-between gap-4 xl:w-[260px]">
                                            <div className="rounded-[22px] border border-sky-400/25 bg-sky-500/10 p-4 text-right shadow-[0_0_32px_rgba(14,165,233,0.12)]">
                                                <div className="flex items-center justify-end gap-2 text-xs font-semibold text-sky-200/80">
                                                    <WalletCards className="h-4 w-4" />
                                                    Talep tutarı
                                                </div>
                                                <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                                                    {money(row.amount)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openApproveConfirm(row)}
                                                    disabled={isBusy}
                                                    className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-emerald-500 px-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <Check className="h-4 w-4" />
                                                    Onayla
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (rejectingId === row.id) {
                                                            openRejectConfirm(row);
                                                        } else {
                                                            setRejectingId(row.id);
                                                            setError("");
                                                        }
                                                    }}
                                                    disabled={isBusy}
                                                    className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-rose-500 px-3 text-sm font-bold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                    {rejectingId === row.id ? "Reddi Onayla" : "Reddet"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {rejectingId === row.id && (
                                        <div className="border-t border-white/10 bg-rose-500/[0.035] p-5">
                                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
                                                <MessageSquareText className="h-4 w-4" />
                                                Red Açıklaması
                                            </label>

                                            <textarea
                                                value={reason}
                                                onChange={(event) =>
                                                    setRejectReasonById((prev) => ({
                                                        ...prev,
                                                        [row.id]: event.target.value,
                                                    }))
                                                }
                                                rows={3}
                                                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-rose-300/60"
                                                placeholder="Çalışana gösterilecek açıklamayı yazın"
                                            />
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
            </div>

            <ConfirmModal
                isOpen={confirmAction != null}
                variant={confirmAction?.type === "APPROVE" ? "success" : "danger"}
                title={
                    confirmAction?.type === "APPROVE"
                        ? "Avans Talebini Onayla"
                        : "Avans Talebini Reddet"
                }
                description={
                    confirmAction?.type === "APPROVE"
                        ? "Bu avans talebini onaylamak istediğinize emin misiniz?"
                        : "Bu avans talebini reddetmek istediğinize emin misiniz?"
                }
                itemName={
                    confirmAction
                        ? `${getEmployeeName(confirmAction.row.employeeId)} - ${money(confirmAction.row.amount)}`
                        : ""
                }
                detailText={
                    confirmAction?.type === "APPROVE"
                        ? "Onaylanan avans talebi sistemde onaylı olarak işaretlenecektir."
                        : `Red açıklaması: ${rejectReasonById[confirmAction?.row.id ?? 0] || "-"}`
                }
                confirmText={confirmAction?.type === "APPROVE" ? "Evet, Onayla" : "Evet, Reddet"}
                cancelText="Vazgeç"
                isLoading={confirmAction ? actionId === confirmAction.row.id : false}
                onClose={closeConfirmModal}
                onConfirm={confirmSelectedAction}
            />

        </div>
    );
};

export default AdvanceRequestsPage;
