import { useEffect, useMemo, useState } from "react";
import { getAllEmployees } from "../../services/employeeService";
import { addBonus, addDeduction, createSalary } from "../../services/payrollService";

type Employee = {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
};

const SalaryAssignmentPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [baseSalary, setBaseSalary] = useState("");
    const [bonus, setBonus] = useState("");
    const [deduction, setDeduction] = useState("");
    const [desc, setDesc] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllEmployees()
            .then((rows) => setEmployees(Array.isArray(rows) ? rows : []))
            .catch((e) => {
                console.error(e);
                setMsg("Çalışan listesi yüklenemedi.");
            });
    }, []);

    const employeeId = useMemo(() => Number(selectedEmployeeId), [selectedEmployeeId]);

    const run = async (fn: () => Promise<unknown>, okMsg: string) => {
        if (!employeeId || !Number.isFinite(employeeId)) {
            setMsg("Çalışan seçin.");
            return;
        }

        try {
            setLoading(true);
            setMsg("");
            await fn();
            setMsg(okMsg);
        } catch (e) {
            console.error(e);
            setMsg("İşlem başarısız.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 text-slate-100">
            <div>
                <h1 className="text-2xl font-semibold">Maaş Ataması</h1>
                <p className="text-sm text-slate-400 mt-1">HR / Muhasebe çalışanlara maaş, bonus ve kesinti ataması yapar.</p>
            </div>

            {msg && <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-sky-200">{msg}</div>}

            <section className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4 space-y-3">
                <label className="text-sm text-slate-300">Çalışan</label>
                <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2"
                >
                    <option value="">Seçiniz</option>
                    {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                            {e.firstName || ""} {e.lastName || ""} ({e.email || e.id})
                        </option>
                    ))}
                </select>
            </section>

            <section className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4 space-y-3">
                <h2 className="font-semibold">Temel Maaş</h2>
                <div className="flex gap-2">
                    <input
                        value={baseSalary}
                        onChange={(e) => setBaseSalary(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2"
                        placeholder="Tutar"
                    />
                    <button
                        disabled={loading}
                        onClick={() =>
                            run(
                                () => createSalary({ employeeId, baseSalary: Number(baseSalary.replace(",", ".")) }),
                                "Maaş atandı."
                            )
                        }
                        className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950 hover:bg-sky-400 disabled:opacity-60"
                    >
                        Kaydet
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4 space-y-3">
                <h2 className="font-semibold">Bonus</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                        value={bonus}
                        onChange={(e) => setBonus(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2"
                        placeholder="Tutar"
                    />
                    <input
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2"
                        placeholder="Açıklama"
                    />
                    <button
                        disabled={loading}
                        onClick={() =>
                            run(
                                () => addBonus({ employeeId, amount: Number(bonus.replace(",", ".")), description: desc || undefined }),
                                "Bonus atandı."
                            )
                        }
                        className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
                    >
                        Bonus Ekle
                    </button>
                </div>
            </section>

            <section className="rounded-2xl border border-slate-700/70 bg-slate-950/30 p-4 space-y-3">
                <h2 className="font-semibold">Kesinti</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                        value={deduction}
                        onChange={(e) => setDeduction(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2"
                        placeholder="Tutar"
                    />
                    <input
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2"
                        placeholder="Açıklama"
                    />
                    <button
                        disabled={loading}
                        onClick={() =>
                            run(
                                () =>
                                    addDeduction({
                                        employeeId,
                                        amount: Number(deduction.replace(",", ".")),
                                        description: desc || undefined,
                                    }),
                                "Kesinti eklendi."
                            )
                        }
                        className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
                    >
                        Kesinti Ekle
                    </button>
                </div>
            </section>
        </div>
    );
};

export default SalaryAssignmentPage;
