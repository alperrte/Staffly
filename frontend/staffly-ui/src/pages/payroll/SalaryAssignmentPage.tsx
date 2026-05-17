import { useEffect, useMemo, useState } from "react";
import {
    BadgePlus,
    Banknote,
    BriefcaseBusiness,
    CheckCircle2,
    CircleMinus,
    Loader2,
    Mail,
    Search,
    UserRound,
} from "lucide-react";
import { getAllEmployees } from "../../services/employeeService";
import {
    addBonus,
    addDeduction,
    createSalary,
    getEmployeePayrollOverview,
    type EmployeePayrollOverview,
} from "../../services/payrollService";
import type { NormalizedEmployee } from "../../types/employeeTypes";

const money = (value: string | number | null | undefined) => {
    if (value == null || value === "") return "-";
    const amount = Number(String(value).replace(",", "."));
    if (!Number.isFinite(amount)) return String(value);
    return amount.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
};

const parseAmount = (value: string) => Number(value.replace(",", "."));

const inputClass =
    "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/25";

const panelClass = "rounded-[26px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_34px_rgba(15,23,42,0.35)]";

const SalaryAssignmentPage = () => {
    const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [query, setQuery] = useState("");
    const [overview, setOverview] = useState<EmployeePayrollOverview | null>(null);
    const [baseSalary, setBaseSalary] = useState("");
    const [bonus, setBonus] = useState("");
    const [bonusDesc, setBonusDesc] = useState("");
    const [deduction, setDeduction] = useState("");
    const [deductionDesc, setDeductionDesc] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);

    useEffect(() => {
        getAllEmployees()
            .then((rows) => setEmployees(Array.isArray(rows) ? rows : []))
            .catch((err) => {
                console.error(err);
                setError("Çalışan listesi yüklenemedi.");
            });
    }, []);

    const employeeId = Number(selectedEmployeeId);
    const selectedEmployee = employees.find((employee) => employee.id === employeeId) ?? null;

    const filteredEmployees = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return employees;

        return employees.filter((employee) =>
            [
                employee.basicInfo?.fullName,
                employee.email,
                employee.organizationInfo?.departmentName,
                employee.organizationInfo?.positionName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(term)
        );
    }, [employees, query]);

    const loadOverview = async (id: number) => {
        try {
            setOverviewLoading(true);
            setOverview(await getEmployeePayrollOverview(id));
        } catch (err) {
            console.error(err);
            setOverview(null);
        } finally {
            setOverviewLoading(false);
        }
    };

    useEffect(() => {
        setMessage("");
        setError("");
        if (employeeId) {
            loadOverview(employeeId);
        } else {
            setOverview(null);
        }
    }, [employeeId]);

    const run = async (fn: () => Promise<unknown>, okMessage: string, clear: () => void) => {
        if (!employeeId || !Number.isFinite(employeeId)) {
            setError("Önce bir çalışan seçin.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");
            await fn();
            clear();
            setMessage(okMessage);
            await loadOverview(employeeId);
        } catch (err) {
            console.error(err);
            setError("İşlem başarısız. Tutarı ve çalışan seçimini kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    const disabled = loading || !employeeId;

    return (
        <div className="space-y-6 text-slate-100">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">HR / Muhasebe</div>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Maaş Ataması</h1>
                    <p className="mt-2 max-w-2xl text-sm text-slate-400">
                        Çalışan seçin, güncel maaş durumunu kontrol edin; maaş, bonus ve kesinti işlemlerini ayrı panellerden yönetin.
                    </p>
                </div>
            </div>

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            {message && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

            <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
                <section className={panelClass}>
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                            <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-white">Çalışan Seçimi</h2>
                            <p className="text-xs text-slate-500">{employees.length} çalışan listelendi</p>
                        </div>
                    </div>

                    <div className="relative mb-3">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            className={`${inputClass} pl-11`}
                            placeholder="Ad, e-posta, departman ara"
                        />
                    </div>

                    <div className="max-h-[31rem] space-y-2 overflow-y-auto pr-1">
                        {filteredEmployees.map((employee) => {
                            const active = employee.id === employeeId;
                            return (
                                <button
                                    key={employee.id}
                                    type="button"
                                    onClick={() => setSelectedEmployeeId(String(employee.id))}
                                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                                        active
                                            ? "border-sky-400/60 bg-sky-500/15"
                                            : "border-white/10 bg-white/[0.03] hover:border-sky-400/30 hover:bg-sky-500/10"
                                    }`}
                                >
                                    <div className="font-semibold text-white">{employee.basicInfo.fullName}</div>
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                                        <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{employee.email}</span>
                                        <span>{employee.organizationInfo.departmentName}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <div className="space-y-5">
                    <section className={panelClass}>
                        {selectedEmployee ? (
                            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                                <div>
                                    <div className="text-sm text-slate-400">Seçili çalışan</div>
                                    <h2 className="mt-1 text-2xl font-semibold text-white">{selectedEmployee.basicInfo.fullName}</h2>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                                        <span className="rounded-full bg-white/5 px-3 py-1">{selectedEmployee.organizationInfo.departmentName}</span>
                                        <span className="rounded-full bg-white/5 px-3 py-1">{selectedEmployee.organizationInfo.positionName}</span>
                                    </div>
                                </div>
                                <div className="grid min-w-[260px] grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <div className="text-xs text-slate-400">Mevcut brüt</div>
                                        <div className="mt-1 font-semibold text-white">
                                            {overviewLoading ? "..." : money(overview?.currentSalary?.baseSalary)}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                        <div className="text-xs text-slate-400">Son net</div>
                                        <div className="mt-1 font-semibold text-white">{overviewLoading ? "..." : money(overview?.lastNetSalary)}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">
                                İşlem yapmak için soldan bir çalışan seçin.
                            </div>
                        )}
                    </section>

                    <div className="grid gap-5 lg:grid-cols-3">
                        <section className={panelClass}>
                            <div className="mb-4 flex items-center gap-3">
                                <Banknote className="h-5 w-5 text-sky-300" />
                                <h3 className="font-semibold text-white">Temel Maaş</h3>
                            </div>
                            <input value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className={inputClass} placeholder="Brüt maaş tutarı" />
                            <button
                                disabled={disabled}
                                onClick={() =>
                                    run(
                                        () => createSalary({ employeeId, baseSalary: parseAmount(baseSalary) }),
                                        "Maaş ataması kaydedildi.",
                                        () => setBaseSalary("")
                                    )
                                }
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Kaydet
                            </button>
                        </section>

                        <section className={panelClass}>
                            <div className="mb-4 flex items-center gap-3">
                                <BadgePlus className="h-5 w-5 text-emerald-300" />
                                <h3 className="font-semibold text-white">Bonus</h3>
                            </div>
                            <div className="space-y-3">
                                <input value={bonus} onChange={(e) => setBonus(e.target.value)} className={inputClass} placeholder="Bonus tutarı" />
                                <input value={bonusDesc} onChange={(e) => setBonusDesc(e.target.value)} className={inputClass} placeholder="Açıklama" />
                            </div>
                            <button
                                disabled={disabled}
                                onClick={() =>
                                    run(
                                        () => addBonus({ employeeId, amount: parseAmount(bonus), description: bonusDesc || undefined }),
                                        "Bonus ataması yapıldı.",
                                        () => {
                                            setBonus("");
                                            setBonusDesc("");
                                        }
                                    )
                                }
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <BadgePlus className="h-4 w-4" />
                                Bonus Ekle
                            </button>
                        </section>

                        <section className={panelClass}>
                            <div className="mb-4 flex items-center gap-3">
                                <CircleMinus className="h-5 w-5 text-amber-300" />
                                <h3 className="font-semibold text-white">Kesinti</h3>
                            </div>
                            <div className="space-y-3">
                                <input value={deduction} onChange={(e) => setDeduction(e.target.value)} className={inputClass} placeholder="Kesinti tutarı" />
                                <input value={deductionDesc} onChange={(e) => setDeductionDesc(e.target.value)} className={inputClass} placeholder="Açıklama" />
                            </div>
                            <button
                                disabled={disabled}
                                onClick={() =>
                                    run(
                                        () => addDeduction({ employeeId, amount: parseAmount(deduction), description: deductionDesc || undefined }),
                                        "Kesinti ataması yapıldı.",
                                        () => {
                                            setDeduction("");
                                            setDeductionDesc("");
                                        }
                                    )
                                }
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <BriefcaseBusiness className="h-4 w-4" />
                                Kesinti Ekle
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryAssignmentPage;
