import { useEffect, useMemo, useState } from "react";
import { Banknote, CalendarDays, FileText, HandCoins, History, Loader2, Send } from "lucide-react";
import {
    getMyAdvances,
    getMyBonuses,
    getMyDeductions,
    getMyPayrollOverview,
    getMyPayrolls,
    generateMyPayroll,
    requestAdvance,
    type AdvanceRecord,
    type BonusRecord,
    type DeductionRecord,
    type EmployeePayrollOverview,
    type PayrollResponse,
} from "../../services/payrollService";
import { getTokenEmployeeId } from "../../utils/auth";

const panelClass = "rounded-[26px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_34px_rgba(15,23,42,0.35)]";

const money = (value: string | number | null | undefined) => {
    if (value == null || value === "") return "-";
    const amount = Number(value);
    if (!Number.isFinite(amount)) return String(value);
    return amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
};

const formatDate = (value: string | null | undefined) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("tr-TR");
};

const advanceStatus = (advance: AdvanceRecord) => {
    if (advance.approved) return { label: "Onaylandı", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" };
    if (advance.rejectionReason) return { label: "Reddedildi", className: "border-rose-500/30 bg-rose-500/10 text-rose-200" };
    return { label: "Beklemede", className: "border-amber-500/30 bg-amber-500/10 text-amber-200" };
};

const EmployeeSalaryTrackingPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [overview, setOverview] = useState<EmployeePayrollOverview | null>(null);
    const [payrolls, setPayrolls] = useState<PayrollResponse[]>([]);
    const [bonuses, setBonuses] = useState<BonusRecord[]>([]);
    const [deductions, setDeductions] = useState<DeductionRecord[]>([]);
    const [advances, setAdvances] = useState<AdvanceRecord[]>([]);
    const [advanceAmount, setAdvanceAmount] = useState("");
    const [advanceDate, setAdvanceDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [submitting, setSubmitting] = useState(false);
    const [generatingPayroll, setGeneratingPayroll] = useState(false);
    const [message, setMessage] = useState("");

    const load = async () => {
        try {
            setLoading(true);
            setError("");

            const [ov, pr, b, d, a] = await Promise.all([
                getMyPayrollOverview(),
                getMyPayrolls(),
                getMyBonuses(),
                getMyDeductions(),
                getMyAdvances(),
            ]);

            setOverview(ov);
            setPayrolls(pr);
            setBonuses(b);
            setDeductions(d);
            setAdvances(a);
        } catch (err) {
            console.error(err);
            setError("Maaş verileri alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const totals = useMemo(
        () => ({
            bonus: bonuses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
            deduction: deductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
        }),
        [bonuses, deductions]
    );

    const handleAdvance = async () => {
        const amount = Number(advanceAmount.replace(",", "."));
        const employeeId = getTokenEmployeeId();

        if (!employeeId) {
            setMessage("Employee bilgisi bulunamadı.");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setMessage("Geçerli bir avans tutarı girin.");
            return;
        }

        try {
            setSubmitting(true);
            setMessage("");
            await requestAdvance({ employeeId, amount, requestDate: advanceDate });
            setAdvanceAmount("");
            setMessage("Avans talebi gönderildi.");
            await load();
        } catch (err) {
            console.error(err);
            setMessage("Avans talebi gönderilemedi.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleGeneratePayroll = async () => {
        const today = new Date();

        try {
            setGeneratingPayroll(true);
            setMessage("");
            await generateMyPayroll({
                month: today.getMonth() + 1,
                year: today.getFullYear(),
            });
            setMessage("Bordro oluşturuldu.");
            await load();
        } catch (err) {
            console.error(err);
            setMessage("Bordro oluşturulamadı.");
        } finally {
            setGeneratingPayroll(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-full w-full px-5 py-6 text-slate-300 sm:px-6 lg:px-8">
                Maaş verileri yükleniyor...
            </div>
        );
    }

    const currentGross = overview?.lastBaseSalary ?? overview?.currentSalary?.baseSalary;
    const currentNet = payrolls[0]?.netSalary ?? overview?.lastNetSalary;

    return (
        <div className="min-h-full w-full space-y-6 px-5 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">Çalışan</div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Maaş Takibi</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    Güncel maaşınızı, dönem bordrolarınızı ve avans taleplerinizin durumunu tek ekrandan takip edin.
                </p>
            </div>

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            {message && <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">{message}</div>}

            <div className="grid gap-4 md:grid-cols-4">
                <div className={panelClass}>
                    <Banknote className="h-6 w-6 text-sky-300" />
                    <div className="mt-4 text-sm text-slate-400">Brüt Maaş</div>
                    <div className="mt-1 text-2xl font-semibold text-white">{money(currentGross)}</div>
                </div>
                <div className={panelClass}>
                    <HandCoins className="h-6 w-6 text-emerald-300" />
                    <div className="mt-4 text-sm text-slate-400">Net Maaş</div>
                    <div className="mt-1 text-2xl font-semibold text-white">{money(currentNet)}</div>
                </div>
                <div className={panelClass}>
                    <History className="h-6 w-6 text-amber-300" />
                    <div className="mt-4 text-sm text-slate-400">Bekleyen Avans</div>
                    <div className="mt-1 text-2xl font-semibold text-white">{overview?.pendingAdvanceCount ?? 0}</div>
                </div>
                <div className={panelClass}>
                    <FileText className="h-6 w-6 text-violet-300" />
                    <div className="mt-4 text-sm text-slate-400">Bordro Kaydı</div>
                    <div className="mt-1 text-2xl font-semibold text-white">{overview?.payrollRecordCount ?? payrolls.length}</div>
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
                <section className={panelClass}>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                            <Send className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Avans Talebi</h2>
                            <p className="text-xs text-slate-500">Talebiniz HR/Muhasebe onayına düşer.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <input
                            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400/60"
                            placeholder="Talep tutarı"
                            value={advanceAmount}
                            onChange={(event) => setAdvanceAmount(event.target.value)}
                        />
                        <input
                            type="date"
                            className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
                            value={advanceDate}
                            onChange={(event) => setAdvanceDate(event.target.value)}
                        />
                        <button
                            onClick={handleAdvance}
                            disabled={submitting}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Avans Talep Et
                        </button>
                    </div>
                </section>

                <section className={panelClass}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="font-semibold text-white">Dönem Bordroları</h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                Son dönem: {overview?.lastPayrollMonth && overview?.lastPayrollYear ? `${overview.lastPayrollMonth}/${overview.lastPayrollYear}` : "-"}
                            </span>
                            <button
                                onClick={handleGeneratePayroll}
                                disabled={generatingPayroll}
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
                            >
                                {generatingPayroll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                                Bordro Oluştur
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {payrolls.length === 0 ? (
                            <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">Henüz bordro kaydı yok.</p>
                        ) : (
                            payrolls.map((payroll, index) => (
                                <div key={payroll.id ?? index} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 md:grid-cols-5">
                                    <div>
                                        <div className="text-xs text-slate-500">Dönem</div>
                                        <div className="font-semibold text-white">{payroll.month}/{payroll.year}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Brüt</div>
                                        <div className="text-slate-200">{money(payroll.baseSalary)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Bonus</div>
                                        <div className="text-emerald-200">{money(payroll.totalBonus)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Kesinti</div>
                                        <div className="text-amber-200">{money(payroll.totalDeduction)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500">Net</div>
                                        <div className="font-semibold text-white">{money(payroll.netSalary)}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <section className={panelClass}>
                    <h2 className="mb-4 font-semibold text-white">Avans Geçmişi</h2>
                    <div className="space-y-3">
                        {advances.length === 0 ? (
                            <p className="text-sm text-slate-400">Avans kaydı yok.</p>
                        ) : (
                            advances.map((advance) => {
                                const status = advanceStatus(advance);
                                return (
                                    <div key={advance.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-white">#{advance.id} - {money(advance.amount)}</div>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    {formatDate(advance.requestDate || advance.createdAt)}
                                                </div>
                                            </div>
                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
                                        </div>
                                        {advance.rejectionReason && <p className="mt-3 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200">{advance.rejectionReason}</p>}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className={panelClass}>
                    <h2 className="mb-4 font-semibold text-white">Bonus / Kesinti Özeti</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <div className="text-sm text-emerald-100/80">Toplam bonus</div>
                            <div className="mt-1 text-2xl font-semibold text-white">{money(totals.bonus)}</div>
                            <div className="mt-1 text-xs text-emerald-100/70">{bonuses.length} kayıt</div>
                        </div>
                        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                            <div className="text-sm text-amber-100/80">Toplam kesinti</div>
                            <div className="mt-1 text-2xl font-semibold text-white">{money(totals.deduction)}</div>
                            <div className="mt-1 text-xs text-amber-100/70">{deductions.length} kayıt</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default EmployeeSalaryTrackingPage;
