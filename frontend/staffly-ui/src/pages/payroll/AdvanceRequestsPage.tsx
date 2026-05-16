import { useEffect, useMemo, useState } from "react";
import { Check, Clock3, MessageSquareText, RefreshCw, Search, X } from "lucide-react";
import { getAllEmployees } from "../../services/employeeService";
import {
    approveAdvance,
    getPendingAdvanceRequests,
    rejectAdvance,
    type AdvanceRecord,
} from "../../services/payrollService";
import type { NormalizedEmployee } from "../../types/employeeTypes";

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
    const [message, setMessage] = useState("");
    const [query, setQuery] = useState("");
    const [actionId, setActionId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReasonById, setRejectReasonById] = useState<Record<number, string>>({});

    const employeeById = useMemo(
        () => new Map(employees.map((employee) => [employee.id, employee])),
        [employees]
    );

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
                employee?.basicInfo.fullName,
                employee?.email,
                employee?.organizationInfo.departmentName,
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
            const [advanceRows, employeeRows] = await Promise.all([
                getPendingAdvanceRequests(),
                getAllEmployees().catch(() => []),
            ]);
            setRows(advanceRows);
            setEmployees(Array.isArray(employeeRows) ? employeeRows : []);
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
        <div className="space-y-6 text-slate-100">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">HR / Muhasebe</div>
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
                                <article key={row.id} className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <span>Talep #{row.id}</span>
                                                <span className="h-1 w-1 rounded-full bg-slate-600" />
                                                <span>{formatDate(row.requestDate || row.createdAt)}</span>
                                            </div>
                                            <h3 className="mt-2 text-lg font-semibold text-white">
                                                {employee?.basicInfo.fullName || `Çalışan #${row.employeeId}`}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                                                {employee?.email && <span>{employee.email}</span>}
                                                {employee?.organizationInfo.departmentName && (
                                                    <span className="rounded-full bg-white/5 px-2 py-1">{employee.organizationInfo.departmentName}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-right">
                                            <div className="text-xs text-sky-200/80">Talep tutarı</div>
                                            <div className="mt-1 text-xl font-semibold text-white">{money(row.amount)}</div>
                                        </div>
                                    </div>

                                    {rejectingId === row.id && (
                                        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3">
                                            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-200">
                                                <MessageSquareText className="h-4 w-4" />
                                                Red Açıklaması
                                            </label>
                                            <textarea
                                                value={reason}
                                                onChange={(event) =>
                                                    setRejectReasonById((prev) => ({ ...prev, [row.id]: event.target.value }))
                                                }
                                                rows={3}
                                                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-rose-300/60"
                                                placeholder="Çalışana gösterilecek açıklamayı yazın"
                                            />
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onApprove(row.id)}
                                            disabled={isBusy}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
                                        >
                                            <Check className="h-4 w-4" />
                                            Onayla
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (rejectingId === row.id) {
                                                    onReject(row.id);
                                                } else {
                                                    setRejectingId(row.id);
                                                }
                                            }}
                                            disabled={isBusy}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4" />
                                            {rejectingId === row.id ? "Reddi Onayla" : "Reddet"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdvanceRequestsPage;
