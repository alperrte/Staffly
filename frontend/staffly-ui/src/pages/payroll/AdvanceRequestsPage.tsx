import { useEffect, useState } from "react";
import {
    approveAdvance,
    getPendingAdvanceRequests,
    rejectAdvance,
    type AdvanceRecord,
} from "../../services/payrollService";

const AdvanceRequestsPage = () => {
    const [rows, setRows] = useState<AdvanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionId, setActionId] = useState<number | null>(null);
    const [rejectReasonById, setRejectReasonById] = useState<Record<number, string>>({});

    const load = async () => {
        try {
            setLoading(true);
            setError("");
            setRows(await getPendingAdvanceRequests());
        } catch (e) {
            console.error(e);
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
            await approveAdvance(id);
            await load();
        } catch (e) {
            console.error(e);
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
            await rejectAdvance(id, { reason });
            await load();
        } catch (e) {
            console.error(e);
            setError("Avans reddedilemedi.");
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="space-y-5 text-slate-100">
            <div>
                <h1 className="text-2xl font-semibold">Avans Talepleri</h1>
                <p className="text-sm text-slate-400 mt-1">HR / Muhasebe bekleyen avans taleplerini onaylar veya açıklama ile reddeder.</p>
            </div>

            {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">{error}</div>}

            {loading ? (
                <div className="text-slate-300">Yükleniyor...</div>
            ) : rows.length === 0 ? (
                <div className="rounded-xl border border-slate-700/70 bg-slate-950/30 p-4 text-slate-400">Bekleyen avans talebi yok.</div>
            ) : (
                <div className="space-y-3">
                    {rows.map((r) => (
                        <div key={r.id} className="rounded-xl border border-slate-700/70 bg-slate-950/30 p-4 space-y-3">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span>Talep #{r.id}</span>
                                <span>Çalışan: {r.employeeId}</span>
                                <span>Tutar: {Number(r.amount).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
                                <span>Tarih: {r.requestDate || "-"}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input
                                    className="md:col-span-2 rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2"
                                    placeholder="Red gerekçesi"
                                    value={rejectReasonById[r.id] || ""}
                                    onChange={(e) =>
                                        setRejectReasonById((prev) => ({ ...prev, [r.id]: e.target.value }))
                                    }
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onApprove(r.id)}
                                        disabled={actionId === r.id}
                                        className="rounded-lg bg-emerald-500 px-4 py-2 text-slate-950 font-semibold hover:bg-emerald-400 disabled:opacity-60"
                                    >
                                        Onayla
                                    </button>
                                    <button
                                        onClick={() => onReject(r.id)}
                                        disabled={actionId === r.id}
                                        className="rounded-lg bg-rose-500 px-4 py-2 text-white font-semibold hover:bg-rose-400 disabled:opacity-60"
                                    >
                                        Reddet
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdvanceRequestsPage;
