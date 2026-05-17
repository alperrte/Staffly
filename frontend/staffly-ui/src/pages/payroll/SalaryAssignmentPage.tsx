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
    getEmployeeSalaries,
    type EmployeePayrollOverview,
    type SalaryRecord,
} from "../../services/payrollService";
import type { NormalizedEmployee } from "../../types/employeeTypes";
import ConfirmModal from "../../components/common/ConfirmModal";

type SalaryActionType = "SALARY" | "BONUS" | "DEDUCTION";

type SalaryConfirmAction =
    | { type: "SALARY" }
    | { type: "BONUS" }
    | { type: "DEDUCTION" }
    | null;

const money = (value: string | number | null | undefined) => {
    if (value == null || value === "") return "-";

    const amount = Number(String(value).replace(",", "."));

    if (!Number.isFinite(amount)) return String(value);

    return amount.toLocaleString("tr-TR", {
        style: "currency",
        currency: "TRY",
    });
};

const parseAmount = (value: string) => Number(value.replace(",", "."));

const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("tr-TR");
};

const inputClass =
    "w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/25";

const panelClass =
    "rounded-[26px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_0_34px_rgba(15,23,42,0.35)]";

const SalaryAssignmentPage = () => {
    const [employees, setEmployees] = useState<NormalizedEmployee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [query, setQuery] = useState("");

    const [overview, setOverview] = useState<EmployeePayrollOverview | null>(null);
    const [salaryHistory, setSalaryHistory] = useState<SalaryRecord[]>([]);

    const [baseSalary, setBaseSalary] = useState("");
    const [bonus, setBonus] = useState("");
    const [bonusDesc, setBonusDesc] = useState("");
    const [deduction, setDeduction] = useState("");
    const [deductionDesc, setDeductionDesc] = useState("");

    const [activeAction, setActiveAction] = useState<SalaryActionType>("SALARY");
    const [confirmAction, setConfirmAction] = useState<SalaryConfirmAction>(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [salaryHistoryLoading, setSalaryHistoryLoading] = useState(false);

    useEffect(() => {
        getAllEmployees()
            .then((rows) => setEmployees(Array.isArray(rows) ? rows : []))
            .catch((err) => {
                console.error(err);
                setError("Çalışan listesi yüklenemedi.");
            });
    }, []);

    const employeeId = Number(selectedEmployeeId);

    const selectedEmployee =
        employees.find((employee) => employee.id === employeeId) ?? null;

    const getEmployeeEmail = (employee: NormalizedEmployee) =>
        employee.contactInfo?.email || employee.email || "-";

    const filteredEmployees = useMemo(() => {
        const term = query.trim().toLowerCase();

        if (!term) return employees;

        return employees.filter((employee) =>
            [
                employee.basicInfo?.fullName,
                employee.basicInfo?.employeeCode,
                employee.contactInfo?.email,
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

    const loadSalaryHistory = async (id: number) => {
        try {
            setSalaryHistoryLoading(true);
            setSalaryHistory(await getEmployeeSalaries(id));
        } catch (err) {
            console.error(err);
            setSalaryHistory([]);
        } finally {
            setSalaryHistoryLoading(false);
        }
    };

    useEffect(() => {
        const currentBaseSalary = overview?.currentSalary?.baseSalary;

        if (currentBaseSalary != null && currentBaseSalary !== "") {
            setBaseSalary(String(currentBaseSalary));
        } else {
            setBaseSalary("");
        }
    }, [overview?.currentSalary?.baseSalary]);



    useEffect(() => {
        setMessage("");
        setError("");

        if (employeeId && Number.isFinite(employeeId)) {
            loadOverview(employeeId);
            loadSalaryHistory(employeeId);
        } else {
            setOverview(null);
            setSalaryHistory([]);
        }
    }, [employeeId]);

    const run = async (
        fn: () => Promise<unknown>,
        okMessage: string,
        clear: () => void
    ) => {
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
            await Promise.all([loadOverview(employeeId), loadSalaryHistory(employeeId)]);
        } catch (err) {
            console.error(err);
            setError("İşlem başarısız. Tutarı ve çalışan seçimini kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    const disabled = loading || !employeeId;

    const validateAndOpenConfirm = (type: SalaryActionType) => {
        if (!employeeId || !Number.isFinite(employeeId)) {
            setError("Önce bir çalışan seçin.");
            return;
        }

        if (type === "SALARY") {
            if (!baseSalary.trim() || !Number.isFinite(parseAmount(baseSalary))) {
                setError("Geçerli bir brüt maaş tutarı girin.");
                return;
            }
        }

        if (type === "BONUS") {
            if (!bonus.trim() || !Number.isFinite(parseAmount(bonus))) {
                setError("Geçerli bir bonus tutarı girin.");
                return;
            }
        }

        if (type === "DEDUCTION") {
            if (!deduction.trim() || !Number.isFinite(parseAmount(deduction))) {
                setError("Geçerli bir kesinti tutarı girin.");
                return;
            }
        }

        setError("");
        setConfirmAction({ type });
    };

    const closeConfirmModal = () => {
        if (loading) return;
        setConfirmAction(null);
    };

    const confirmSelectedAction = async () => {
        if (!confirmAction) return;

        if (confirmAction.type === "SALARY") {
            await run(
                () =>
                    createSalary({
                        employeeId,
                        baseSalary: parseAmount(baseSalary),
                    }),
                "Maaş ataması kaydedildi.",
                () => setBaseSalary("")
            );
        }

        if (confirmAction.type === "BONUS") {
            await run(
                () =>
                    addBonus({
                        employeeId,
                        amount: parseAmount(bonus),
                        description: bonusDesc || undefined,
                    }),
                "Bonus ataması yapıldı.",
                () => {
                    setBonus("");
                    setBonusDesc("");
                }
            );
        }

        if (confirmAction.type === "DEDUCTION") {
            await run(
                () =>
                    addDeduction({
                        employeeId,
                        amount: parseAmount(deduction),
                        description: deductionDesc || undefined,
                    }),
                "Kesinti ataması yapıldı.",
                () => {
                    setDeduction("");
                    setDeductionDesc("");
                }
            );
        }

        setConfirmAction(null);
    };

    const actionCards = [
        {
            type: "SALARY" as const,
            title: "Temel Maaş",
            description: "Brüt maaş bilgisini güncelle",
            value: overviewLoading ? "..." : money(overview?.currentSalary?.baseSalary),
            icon: Banknote,
            color: "sky",
        },
        {
            type: "BONUS" as const,
            title: "Bonus",
            description: "Ek ödeme tanımla",
            value: bonus.trim() ? money(bonus) : "Bonus ekle",
            icon: BadgePlus,
            color: "emerald",
        },
        {
            type: "DEDUCTION" as const,
            title: "Kesinti",
            description: "Maaş kesintisi tanımla",
            value: deduction.trim() ? money(deduction) : "Kesinti ekle",
            icon: CircleMinus,
            color: "amber",
        },
    ];

    const getActionCardClass = (type: SalaryActionType, color: string) => {
        const active = activeAction === type;

        if (color === "sky") {
            return active
                ? "border-sky-400/60 bg-sky-500/15"
                : "border-white/10 bg-white/[0.03] hover:border-sky-400/35 hover:bg-sky-500/10";
        }

        if (color === "emerald") {
            return active
                ? "border-emerald-400/60 bg-emerald-500/15"
                : "border-white/10 bg-white/[0.03] hover:border-emerald-400/35 hover:bg-emerald-500/10";
        }

        return active
            ? "border-amber-400/60 bg-amber-500/15"
            : "border-white/10 bg-white/[0.03] hover:border-amber-400/35 hover:bg-amber-500/10";
    };

    const getActionIconClass = (color: string) => {
        if (color === "sky") return "bg-sky-500/15 text-sky-300";
        if (color === "emerald") return "bg-emerald-500/15 text-emerald-300";
        return "bg-amber-500/15 text-amber-300";
    };

    const renderActionForm = () => {
        if (activeAction === "SALARY") {
            return (
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            Brüt Maaş Tutarı
                        </label>
                        <input
                            value={baseSalary}
                            onChange={(event) => setBaseSalary(event.target.value)}
                            className={inputClass}
                            placeholder="Örn: 100000"
                        />
                    </div>

                    <button
                        disabled={disabled}
                        onClick={() => validateAndOpenConfirm("SALARY")}
                        className="inline-flex h-[48px] items-center justify-center gap-2 self-end rounded-2xl bg-sky-500 px-8 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="h-4 w-4" />
                        )}
                        Maaşı Kaydet
                    </button>
                </div>
            );
        }

        if (activeAction === "BONUS") {
            return (
                <div className="grid gap-4 xl:grid-cols-[0.7fr_1fr_auto]">
                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            Bonus Tutarı
                        </label>
                        <input
                            value={bonus}
                            onChange={(event) => setBonus(event.target.value)}
                            className={inputClass}
                            placeholder="Örn: 5000"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                            Açıklama
                        </label>
                        <input
                            value={bonusDesc}
                            onChange={(event) => setBonusDesc(event.target.value)}
                            className={inputClass}
                            placeholder="Örn: Performans primi"
                        />
                    </div>

                    <button
                        disabled={disabled}
                        onClick={() => validateAndOpenConfirm("BONUS")}
                        className="inline-flex h-[48px] items-center justify-center gap-2 self-end rounded-2xl bg-emerald-500 px-8 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <BadgePlus className="h-4 w-4" />
                        Bonus Ekle
                    </button>
                </div>
            );
        }

        return (
            <div className="grid gap-4 xl:grid-cols-[0.7fr_1fr_auto]">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Kesinti Tutarı
                    </label>
                    <input
                        value={deduction}
                        onChange={(event) => setDeduction(event.target.value)}
                        className={inputClass}
                        placeholder="Örn: 1500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Açıklama
                    </label>
                    <input
                        value={deductionDesc}
                        onChange={(event) => setDeductionDesc(event.target.value)}
                        className={inputClass}
                        placeholder="Örn: Avans kesintisi"
                    />
                </div>

                <button
                    disabled={disabled}
                    onClick={() => validateAndOpenConfirm("DEDUCTION")}
                    className="inline-flex h-[48px] items-center justify-center gap-2 self-end rounded-2xl bg-amber-400 px-8 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <BriefcaseBusiness className="h-4 w-4" />
                    Kesinti Ekle
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full bg-[#020817] px-6 py-6 text-slate-100 sm:px-8">
            <div className="flex min-h-[calc(100vh-48px)] flex-col gap-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                            Maaş Ataması
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                            Çalışan seçin, güncel maaş durumunu kontrol edin; maaş,
                            bonus ve kesinti işlemlerini ayrı panellerden yönetin.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {message}
                    </div>
                )}

                <div className="grid flex-1 gap-5 xl:grid-cols-[minmax(340px,420px)_1fr]">
                    <section className={`${panelClass} flex min-h-[560px] flex-col`}>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                                <UserRound className="h-5 w-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold text-white">Çalışan Seçimi</h2>
                                <p className="text-xs text-slate-500">
                                    {employees.length} çalışan listelendi
                                </p>
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

                        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
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
                                        <div className="font-semibold text-white">
                                            {employee.basicInfo.fullName}
                                        </div>

                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-400">
                                            <span className="inline-flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {getEmployeeEmail(employee)}
                                            </span>
                                            <span>
                                                {employee.organizationInfo.departmentName}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <div className="flex flex-col gap-5">
                        <section className={`${panelClass} shrink-0`}>
                            {selectedEmployee ? (
                                <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                                    <div>
                                        <div className="text-sm text-slate-400">
                                            Seçili çalışan
                                        </div>

                                        <h2 className="mt-1 text-2xl font-semibold text-white">
                                            {selectedEmployee.basicInfo.fullName}
                                        </h2>

                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                                            <span className="rounded-full bg-white/5 px-3 py-1">
                                                {selectedEmployee.organizationInfo.departmentName}
                                            </span>
                                            <span className="rounded-full bg-white/5 px-3 py-1">
                                                {selectedEmployee.organizationInfo.positionName}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid min-w-[260px] grid-cols-2 gap-3">
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                            <div className="text-xs text-slate-400">
                                                Mevcut brüt
                                            </div>
                                            <div className="mt-1 font-semibold text-white">
                                                {overviewLoading
                                                    ? "..."
                                                    : money(overview?.currentSalary?.baseSalary)}
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                            <div className="text-xs text-slate-400">
                                                Güncel net
                                            </div>
                                            <div className="mt-1 font-semibold text-white">
                                                {overviewLoading
                                                    ? "..."
                                                    : money(overview?.currentProjectedNetSalary)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">
                                    İşlem yapmak için soldan bir çalışan seçin.
                                </div>
                            )}
                        </section>

                        <div className="grid gap-4 lg:grid-cols-3">
                            {actionCards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <button
                                        key={card.type}
                                        type="button"
                                        onClick={() => setActiveAction(card.type)}
                                        className={`h-[132px] rounded-[22px] border p-4 text-left transition ${getActionCardClass(
                                            card.type,
                                            card.color
                                        )}`}
                                    >
                                        <div className="flex h-full flex-col justify-between">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">
                                                        {card.title}
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {card.description}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${getActionIconClass(
                                                        card.color
                                                    )}`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                            </div>

                                            <div className="text-lg font-bold text-white">
                                                {card.value}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <section className={`${panelClass} shrink-0`}>
                            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {activeAction === "SALARY"
                                            ? "Temel Maaş Düzenleme"
                                            : activeAction === "BONUS"
                                                ? "Bonus İşlemi"
                                                : "Kesinti İşlemi"}
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-400">
                                        {activeAction === "SALARY"
                                            ? "Seçili çalışanın brüt maaş bilgisini buradan güncelleyebilirsiniz."
                                            : activeAction === "BONUS"
                                                ? "Seçili çalışana ek ödeme / bonus tanımlayabilirsiniz."
                                                : "Seçili çalışanın maaşına kesinti tanımlayabilirsiniz."}
                                    </p>
                                </div>

                                {selectedEmployee && (
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                                        <div className="text-xs text-slate-500">
                                            İşlem yapılacak çalışan
                                        </div>
                                        <div className="mt-1 text-sm font-semibold text-white">
                                            {selectedEmployee.basicInfo.fullName}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {renderActionForm()}
                        </section>

                        <section className={`${panelClass} min-h-[180px] flex-1`}>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Maaş Geçmişi</h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Seçili çalışanın geçmiş brüt maaş kayıtları
                                    </p>
                                </div>

                                {selectedEmployee && (
                                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                                        {salaryHistory.length} kayıt
                                    </span>
                                )}
                            </div>

                            {!selectedEmployee ? (
                                <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
                                    Maaş geçmişini görmek için soldan bir çalışan seçin.
                                </div>
                            ) : salaryHistoryLoading ? (
                                <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
                                    Maaş geçmişi yükleniyor...
                                </div>
                            ) : salaryHistory.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-slate-400">
                                    Bu çalışan için maaş kaydı bulunmuyor.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {salaryHistory.map((salary, index) => (
                                        <div
                                            key={salary.id}
                                            className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto_auto]"
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-white">
                                                    {money(salary.baseSalary)}
                                                </div>
                                                <div className="mt-1 text-xs text-slate-400">
                                                    Geçerlilik: {formatDate(salary.effectiveDate)}
                                                </div>
                                            </div>

                                            <div className="text-sm text-slate-300">
                                                {salary.currency || "TRY"}
                                            </div>

                                            <div className="text-xs text-slate-400 sm:text-right">
                                                {index === 0 ? "Güncel kayıt" : formatDate(salary.createdAt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmAction != null}
                variant={
                    confirmAction?.type === "SALARY"
                        ? "info"
                        : confirmAction?.type === "BONUS"
                            ? "success"
                            : "warning"
                }
                title={
                    confirmAction?.type === "SALARY"
                        ? "Maaş Atamasını Kaydet"
                        : confirmAction?.type === "BONUS"
                            ? "Bonus Ekle"
                            : "Kesinti Ekle"
                }
                description={
                    confirmAction?.type === "SALARY"
                        ? "Seçili çalışanın temel maaşını güncellemek istediğinize emin misiniz?"
                        : confirmAction?.type === "BONUS"
                            ? "Seçili çalışana bonus eklemek istediğinize emin misiniz?"
                            : "Seçili çalışana kesinti eklemek istediğinize emin misiniz?"
                }
                itemName={
                    selectedEmployee
                        ? `${selectedEmployee.basicInfo.fullName} - ${
                            confirmAction?.type === "SALARY"
                                ? money(baseSalary)
                                : confirmAction?.type === "BONUS"
                                    ? money(bonus)
                                    : money(deduction)
                        }`
                        : ""
                }
                detailText={
                    confirmAction?.type === "SALARY"
                        ? "Bu işlem çalışanın güncel brüt maaş bilgisini kaydeder."
                        : confirmAction?.type === "BONUS"
                            ? bonusDesc
                                ? `Bonus açıklaması: ${bonusDesc}`
                                : "Bonus açıklaması girilmeden işlem yapılacak."
                            : deductionDesc
                                ? `Kesinti açıklaması: ${deductionDesc}`
                                : "Kesinti açıklaması girilmeden işlem yapılacak."
                }
                confirmText={
                    confirmAction?.type === "SALARY"
                        ? "Evet, Kaydet"
                        : confirmAction?.type === "BONUS"
                            ? "Evet, Bonus Ekle"
                            : "Evet, Kesinti Ekle"
                }
                cancelText="Vazgeç"
                isLoading={loading}
                onClose={closeConfirmModal}
                onConfirm={confirmSelectedAction}
            />
        </div>
    );
};

export default SalaryAssignmentPage;
