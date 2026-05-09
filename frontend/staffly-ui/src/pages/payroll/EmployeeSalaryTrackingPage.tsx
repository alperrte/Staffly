import { useEffect, useState } from "react";
import {
    getMyAdvances,
    getMyBonuses,
    getMyDeductions,
    getMyPayrollOverview,
    getMyPayrolls,
    requestAdvance,
    type AdvanceRecord,
    type BonusRecord,
    type DeductionRecord,
    type EmployeePayrollOverview,
    type PayrollResponse,
} from "../../services/payrollService";
import { getTokenUserId } from "../../utils/auth";

const card = "rounded-2xl border border-slate-700/70 bg-slate-950/40 p-4";

const money = (v: string | number | null | undefined) => {
    if (v == null) return "-";
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    return n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
};

const fmt = (v: string | null | undefined) => {
    if (!v) return "-";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("tr-TR");
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
        } catch (e) {
            console.error(e);
            setError("Maaş verileri alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleAdvance = async () => {
        const n = Number(advanceAmount.replace(",", "."));
        const employeeId = getTokenUserId();

        if (!employeeId) {
            setMessage("Employee bilgisi bulunamadı.");
            return;
        }

        if (!Number.isFinite(n) || n <= 0) {
            setMessage("Geçerli bir avans tutarı girin.");
            return;
        }

        try {
            setSubmitting(true);
            setMessage("");
            await requestAdvance({ employeeId, amount: n, requestDate: advanceDate });
            setAdvanceAmount("");
            setMessage("Avans talebi gönderildi.");
            await load();
        } catch (e) {
            console.error(e);
            setMessage("Avans talebi gönderilemedi.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-slate-300">Maaş verileri yükleniyor...</div>;
    }

    return (
        <div className="space-y-5 text-slate-100">
            <div>
                <h1 className="text-2xl font-semibold">Maaş Takibi</h1>
                <p className="text-sm text-slate-400 mt-1">Net/brüt maaşını, bordrolarını ve avans taleplerini görüntüle.</p>
            </div>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">{error}</div>}
            {message && <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-sky-200">{message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={card}>
                    <div className="text-xs text-slate-400">Brüt Maaş</div>
                    <div className="text-xl font-semibold mt-1">{money(overview?.lastBaseSalary ?? overview?.currentSalary?.baseSalary)}</div>
                </div>
                <div className={card}>
                    <div className="text-xs text-slate-400">Net Maaş</div>
                    <div className="text-xl font-semibold mt-1">{money(overview?.lastNetSalary)}</div>
                </div>
                <div className={card}>
                    <div className="text-xs text-slate-400">Bekleyen Avans</div>
                    <div className="text-xl font-semibold mt-1">{overview?.pendingAdvanceCount ?? 0}</div>
                </div>
            </div>

            <section className={card}>
                <h2 className="font-semibold">Avans Talebi</h2>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2"
                        placeholder="Tutar"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(e.target.value)}
                    />
                    <input
                        type="date"
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2"
                        value={advanceDate}
                        onChange={(e) => setAdvanceDate(e.target.value)}
                    />
                    <button
                        onClick={handleAdvance}
                        disabled={submitting}
                        className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60"
                    >
                        {submitting ? "Gönderiliyor..." : "Avans Talep Et"}
                    </button>
                </div>
            </section>

            <section className={card}>
                <h2 className="font-semibold">Bordro Geçmişi</h2>
                <div className="mt-3 space-y-2">
                    {payrolls.length === 0 ? (
                        <p className="text-sm text-slate-400">Henüz bordro kaydı yok.</p>
                    ) : (
                        payrolls.map((p, i) => (
                            <div key={p.id ?? i} className="rounded-xl border border-slate-700/80 p-3 text-sm flex items-center justify-between">
                                <span>{p.month}/{p.year}</span>
                                <span>Brüt: {money(p.baseSalary)}</span>
                                <span>Net: {money(p.netSalary)}</span>
                                <span className="text-slate-400">{p.status}</span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className={card}>
                <h2 className="font-semibold">Avans Kayıtları</h2>
                <div className="mt-3 space-y-2">
                    {advances.length === 0 ? (
                        <p className="text-sm text-slate-400">Avans kaydı yok.</p>
                    ) : (
                        advances.map((a) => (
                            <div key={a.id} className="rounded-xl border border-slate-700/80 p-3 text-sm flex flex-wrap gap-4">
                                <span>#{a.id}</span>
                                <span>Tutar: {money(a.amount)}</span>
                                <span>Tarih: {fmt(a.requestDate)}</span>
                                <span>Durum: {a.approved ? "Onaylı" : a.rejectionReason ? "Reddedildi" : "Beklemede"}</span>
                                {a.rejectionReason && <span className="text-rose-300">Açıklama: {a.rejectionReason}</span>}
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className={card}>
                <h2 className="font-semibold">Bonus / Kesinti Özetleri</h2>
                <p className="text-sm text-slate-400 mt-1">Bonus: {bonuses.length} kayıt, Kesinti: {deductions.length} kayıt</p>
            </section>
        </div>
    );
};

export default EmployeeSalaryTrackingPage;
