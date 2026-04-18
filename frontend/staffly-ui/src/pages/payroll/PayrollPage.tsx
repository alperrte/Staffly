import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllEmployees } from "../../services/employeeService";
import {
    addBonus,
    addDeduction,
    approveAdvance,
    createSalary,
    generatePayroll,
    getEmployeePayrollOverview,
    requestAdvance,
    type EmployeePayrollOverview,
    type PayrollResponse,
} from "../../services/payrollService";
import { buildYearOptions, PAYROLL_CURRENCY_OPTIONS } from "../../constants/payrollUi";
import { convertForeignToTry } from "../../utils/currencyExchange";

type Employee = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    positionName?: string | null;
    departmentName?: string | null;
    departmentId?: number | null;
    status?: string;
    hireDate?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    gender?: string | null;
};

const emptyDash = (v: unknown) => {
    if (v === null || v === undefined) return "-";
    const s = String(v).trim();
    return s.length ? s : "-";
};

const statusLabelTR: Record<string, string> = {
    ACTIVE: "Aktif",
    INACTIVE: "Pasif",
};

const genderLabelTR: Record<string, string> = {
    MALE: "Erkek",
    FEMALE: "Kadın",
    male: "Erkek",
    female: "Kadın",
};

const formatGenderTR = (value: unknown) => {
    if (value === null || value === undefined) return "-";
    const raw = String(value).trim();
    if (!raw) return "-";
    return genderLabelTR[raw] ?? genderLabelTR[raw.toUpperCase()] ?? raw;
};

const formatMaybeDateTR = (value: unknown) => {
    if (value === null || value === undefined) return "-";
    const s = String(value).trim();
    if (!s) return "-";
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("tr-TR");
};

function payrollFetchErrorMessage(err: unknown): string {
    if (!axios.isAxiosError(err)) {
        return "Maaş özeti alınamadı.";
    }
    if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
        return "Payroll sunucusuna bağlanılamıyor (servis kapalı veya yanlış port / proxy).";
    }
    const status = err.response?.status;
    if (status === 502 || status === 503) {
        return "Payroll sunucusuna ulaşılamıyor (502/503). Vite proxy hedefi kapalı veya yanlış port. Payroll’u çalıştırın (8086), ardından `npm run dev` ile yeniden deneyin. Gerekirse `.env` → VITE_PAYROLL_PROXY_TARGET=http://127.0.0.1:8086";
    }
    if (status === 404) {
        return "Payroll API bulunamadı (adres /api/v1/payrolls olmalı).";
    }
    if (status === 403) {
        return "Payroll erişimi reddedildi (403). Sunucu CORS / güvenlik ayarını kontrol edin; payroll imajını yeniden derleyin.";
    }
    if (status === 401) {
        return "Payroll isteği reddedildi (401).";
    }
    const data = err.response?.data;
    if (data && typeof data === "object" && "message" in data) {
        return String((data as { message?: string }).message);
    }
    return err.message || "Maaş özeti alınamadı.";
}

const formatMoneyTR = (value: unknown, currencyCode = "TRY") => {
    if (value === null || value === undefined) return "—";
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    try {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: currencyCode.length === 3 ? currencyCode : "TRY",
            maximumFractionDigits: 2,
        }).format(n);
    } catch {
        return `${n.toLocaleString("tr-TR")} ${currencyCode}`;
    }
};

const PayrollPage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filtered, setFiltered] = useState<Employee[]>([]);
    const [search, setSearch] = useState("");
    const [loadingList, setLoadingList] = useState(true);
    const [listError, setListError] = useState("");

    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [baseSalary, setBaseSalary] = useState("");
    const [currency, setCurrency] = useState("TRY");

    const [bonusAmount, setBonusAmount] = useState("");
    const [bonusDesc, setBonusDesc] = useState("");

    const [deductionAmount, setDeductionAmount] = useState("");
    const [deductionDesc, setDeductionDesc] = useState("");

    const [advanceAmount, setAdvanceAmount] = useState("");
    const [advanceDate, setAdvanceDate] = useState(() =>
        new Date().toISOString().slice(0, 10)
    );

    const [approveAdvanceId, setApproveAdvanceId] = useState("");

    const [payrollMonth, setPayrollMonth] = useState(() =>
        String(new Date().getMonth() + 1)
    );
    const [payrollYear, setPayrollYear] = useState(() =>
        String(new Date().getFullYear())
    );

    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(
        null
    );
    const [lastPayroll, setLastPayroll] = useState<PayrollResponse | null>(null);

    const [overview, setOverview] = useState<EmployeePayrollOverview | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(false);
    const [overviewError, setOverviewError] = useState("");

    const refreshOverview = useCallback(async (employeeId: number) => {
        try {
            const data = await getEmployeePayrollOverview(employeeId);
            setOverview(data);
            setOverviewError("");
        } catch (e) {
            setOverview(null);
            setOverviewError(payrollFetchErrorMessage(e));
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getAllEmployees();
                const list = Array.isArray(data) ? data : [];
                if (mounted) {
                    setEmployees(list as Employee[]);
                    setFiltered(list as Employee[]);
                }
            } catch (e) {
                console.error(e);
                if (mounted) setListError("Çalışan listesi yüklenemedi.");
            } finally {
                if (mounted) setLoadingList(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const q = search.toLowerCase().trim();
        if (!q) {
            setFiltered(employees);
            return;
        }
        setFiltered(
            employees.filter((emp) => {
                const blob = [emp.firstName, emp.lastName, emp.email, emp.positionName, emp.departmentName]
                    .map((x) => (x == null ? "" : String(x)))
                    .join(" ")
                    .toLowerCase();
                return blob.includes(q);
            })
        );
    }, [search, employees]);

    const selected = useMemo(
        () => employees.find((e) => e.id === selectedId) ?? null,
        [employees, selectedId]
    );

    useEffect(() => {
        if (selectedId == null) {
            setOverview(null);
            setOverviewError("");
            setOverviewLoading(false);
            return;
        }

        let cancelled = false;
        setOverviewLoading(true);
        setOverviewError("");

        getEmployeePayrollOverview(selectedId)
            .then((data) => {
                if (!cancelled) {
                    setOverview(data);
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setOverview(null);
                    setOverviewError(payrollFetchErrorMessage(e));
                }
            })
            .finally(() => {
                if (!cancelled) setOverviewLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedId]);

    const runAction = async (key: string, fn: () => Promise<void>) => {
        if (selectedId == null) {
            setMessage({ type: "err", text: "Önce bir çalışan seçin." });
            return;
        }
        setMessage(null);
        setActionLoading(key);
        try {
            await fn();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } }; message?: string };
            const apiMsg =
                err?.response?.data &&
                typeof err.response.data === "object" &&
                "message" in err.response.data
                    ? String((err.response.data as { message?: string }).message)
                    : null;
            setMessage({
                type: "err",
                text: apiMsg || err?.message || "İşlem başarısız oldu.",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleSaveSalary = () =>
        runAction("salary", async () => {
            const n = Number(String(baseSalary).replace(",", "."));
            if (!Number.isFinite(n) || n <= 0) {
                setMessage({ type: "err", text: "Geçerli bir temel maaş girin." });
                return;
            }
            const cur = currency.trim().toUpperCase();
            let amountTry = n;
            let note = "";
            if (cur !== "TRY") {
                const conv = await convertForeignToTry(n, cur);
                amountTry = conv.tryAmount;
                note = conv.usedFallback
                    ? ` (${n.toLocaleString("tr-TR")} ${cur} ≈ ${amountTry.toLocaleString("tr-TR")} TRY, yaklaşık kur)`
                    : ` (${n.toLocaleString("tr-TR")} ${cur} ≈ ${amountTry.toLocaleString("tr-TR")} TRY, 1 ${cur} = ${conv.rate.toLocaleString("tr-TR", { maximumFractionDigits: 4 })} TRY)`;
            }
            await createSalary({
                employeeId: selectedId!,
                baseSalary: amountTry,
                currency: "TRY",
            });
            setMessage({
                type: "ok",
                text:
                    cur === "TRY"
                        ? "Temel maaş kaydedildi."
                        : `Maaş TRY cinsinden kaydedildi.${note}`,
            });
            setBaseSalary("");
            setCurrency("TRY");
            await refreshOverview(selectedId!);
        });

    const handleBonus = () =>
        runAction("bonus", async () => {
            const n = Number(String(bonusAmount).replace(",", "."));
            if (!Number.isFinite(n) || n <= 0) {
                setMessage({ type: "err", text: "Geçerli bir bonus tutarı girin." });
                return;
            }
            await addBonus({
                employeeId: selectedId!,
                amount: n,
                description: bonusDesc.trim() || undefined,
            });
            setMessage({ type: "ok", text: "Bonus eklendi." });
            setBonusAmount("");
            setBonusDesc("");
            await refreshOverview(selectedId!);
        });

    const handleDeduction = () =>
        runAction("deduction", async () => {
            const n = Number(String(deductionAmount).replace(",", "."));
            if (!Number.isFinite(n) || n <= 0) {
                setMessage({ type: "err", text: "Geçerli bir kesinti tutarı girin." });
                return;
            }
            await addDeduction({
                employeeId: selectedId!,
                amount: n,
                description: deductionDesc.trim() || undefined,
            });
            setMessage({ type: "ok", text: "Kesinti eklendi." });
            setDeductionAmount("");
            setDeductionDesc("");
            await refreshOverview(selectedId!);
        });

    const handleAdvance = () =>
        runAction("advance", async () => {
            const n = Number(String(advanceAmount).replace(",", "."));
            if (!Number.isFinite(n) || n <= 0) {
                setMessage({ type: "err", text: "Geçerli bir avans tutarı girin." });
                return;
            }
            await requestAdvance({
                employeeId: selectedId!,
                amount: n,
                requestDate: advanceDate,
            });
            setMessage({ type: "ok", text: "Avans talebi oluşturuldu." });
            setAdvanceAmount("");
            await refreshOverview(selectedId!);
        });

    const handleApproveAdvance = () =>
        runAction("approve", async () => {
            const id = Number(approveAdvanceId.trim());
            if (!Number.isInteger(id) || id <= 0) {
                setMessage({ type: "err", text: "Geçerli bir avans numarası girin." });
                return;
            }
            await approveAdvance(id);
            setMessage({ type: "ok", text: "Avans onaylandı." });
            setApproveAdvanceId("");
            await refreshOverview(selectedId!);
        });

    const handleGeneratePayroll = () =>
        runAction("generate", async () => {
            const m = Number(payrollMonth);
            const y = Number(payrollYear);
            if (!Number.isInteger(m) || m < 1 || m > 12) {
                setMessage({ type: "err", text: "Ay 1–12 arasında olmalı." });
                return;
            }
            if (!Number.isInteger(y) || y < 2000 || y > 2100) {
                setMessage({ type: "err", text: "Geçerli bir yıl girin." });
                return;
            }
            const res = await generatePayroll({
                employeeId: selectedId!,
                month: m,
                year: y,
            });
            setLastPayroll(res);
            setMessage({ type: "ok", text: "Bordro oluşturuldu." });
            await refreshOverview(selectedId!);
        });

    const monthOptions = useMemo(
        () =>
            Array.from({ length: 12 }, (_, i) => ({
                value: String(i + 1),
                label: new Date(2000, i, 1).toLocaleString("tr-TR", { month: "long" }),
            })),
        []
    );

    const yearOptions = useMemo(() => buildYearOptions(), []);

    return (
        <div className="flex w-full flex-col gap-6">
            <div>
                <h1 className="text-2xl font-semibold text-white">Maaş ve bordro</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Soldan çalışan seçin; maaş, bonus, kesinti ve avans işlemlerini yapın, ardından dönem
                    bordrosunu oluşturun.
                </p>
            </div>

            {listError && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {listError}
                </div>
            )}

            {message && (
                <div
                    className={
                        message.type === "ok"
                            ? "rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
                            : "rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                    }
                >
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(280px,380px)_1fr]">
                <div className="flex min-h-[420px] flex-col rounded-2xl border border-slate-700/80 bg-slate-950/40">
                    <div className="border-b border-slate-700/80 p-4">
                        <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Çalışan ara
                        </label>
                        <input
                            type="search"
                            placeholder="İsim, e-posta, departman..."
                            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/70 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            disabled={loadingList}
                        />
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-2">
                        {loadingList ? (
                            <div className="p-4 text-sm text-slate-400">Yükleniyor...</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-4 text-sm text-slate-400">Kayıt bulunamadı.</div>
                        ) : (
                            <ul className="flex flex-col gap-1">
                                {filtered.map((emp) => {
                                    const active = selectedId === emp.id;
                                    return (
                                        <li key={emp.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedId(emp.id);
                                                    setMessage(null);
                                                    setLastPayroll(null);
                                                }}
                                                className={`w-full rounded-xl border px-3 py-3 text-left text-sm transition ${
                                                    active
                                                        ? "border-sky-500/60 bg-sky-500/15 text-white shadow-[0_0_20px_rgba(14,165,233,0.15)]"
                                                        : "border-transparent bg-slate-900/30 text-slate-200 hover:border-slate-600 hover:bg-slate-800/50"
                                                }`}
                                            >
                                                <div className="font-semibold">
                                                    {emp.firstName} {emp.lastName}
                                                </div>
                                                <div className="mt-0.5 truncate text-xs text-slate-400">
                                                    {emptyDash(emp.email)}
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-[0.7rem] text-slate-500">
                                                    <span>{emptyDash(emp.departmentName)}</span>
                                                    <span className="text-slate-600">·</span>
                                                    <span>{emptyDash(emp.positionName)}</span>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="flex min-h-[420px] flex-col gap-6">
                    {!selected ? (
                        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-600 bg-slate-950/20 p-8 text-center text-slate-400">
                            Devam etmek için soldan bir çalışan seçin.
                        </div>
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-950/80 via-slate-900/50 to-slate-950/80">
                                <div className="border-b border-slate-700/60 bg-slate-900/40 px-5 py-4">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-lg font-bold text-sky-200 ring-1 ring-sky-500/30">
                                                {(selected.firstName?.[0] ?? "?").toUpperCase()}
                                                {(selected.lastName?.[0] ?? "").toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-xl font-semibold text-white">
                                                        {selected.firstName} {selected.lastName}
                                                    </h2>
                                                    {selected.status && (
                                                        <span
                                                            className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide ${
                                                                selected.status === "ACTIVE"
                                                                    ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30"
                                                                    : "bg-slate-600/40 text-slate-300 ring-1 ring-slate-500/40"
                                                            }`}
                                                        >
                                                            {statusLabelTR[selected.status] ?? selected.status}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    Çalışan no: {selected.id}
                                                </p>
                                            </div>
                                        </div>
                                        {overviewLoading && (
                                            <span className="text-xs text-slate-500">Özet yükleniyor…</span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-6 p-5 lg:grid-cols-3">
                                    <div>
                                        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            İletişim
                                        </h3>
                                        <dl className="mt-3 space-y-2 text-sm">
                                            <div>
                                                <dt className="text-xs text-slate-500">E-posta</dt>
                                                <dd className="truncate text-slate-200">{emptyDash(selected.email)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-slate-500">Telefon</dt>
                                                <dd className="text-slate-200">{emptyDash(selected.phone)}</dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div>
                                        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            İş bilgileri
                                        </h3>
                                        <dl className="mt-3 space-y-2 text-sm">
                                            <div>
                                                <dt className="text-xs text-slate-500">Departman</dt>
                                                <dd className="text-slate-200">
                                                    {emptyDash(
                                                        selected.departmentName ??
                                                            (selected.departmentId != null
                                                                ? `Departman #${selected.departmentId}`
                                                                : null)
                                                    )}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-slate-500">Pozisyon</dt>
                                                <dd className="text-slate-200">{emptyDash(selected.positionName)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-slate-500">İşe giriş</dt>
                                                <dd className="text-slate-200">
                                                    {formatMaybeDateTR(selected.hireDate)}
                                                </dd>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <dt className="text-xs text-slate-500">Doğum</dt>
                                                    <dd className="text-slate-200">
                                                        {formatMaybeDateTR(selected.birthDate)}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-slate-500">Cinsiyet</dt>
                                                    <dd className="text-slate-200">
                                                        {formatGenderTR(selected.gender)}
                                                    </dd>
                                                </div>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-4">
                                        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-sky-400/90">
                                            Kayıtlı maaş
                                        </h3>
                                        {overviewError ? (
                                            <div className="mt-2 space-y-1 text-xs text-amber-300/90">
                                                <p>{overviewError}</p>
                                                <p className="text-slate-500">
                                                    Geliştirme ortamında Vite, payroll isteklerini{" "}
                                                    <code className="rounded bg-slate-800 px-1 text-[0.65rem] text-slate-300">
                                                        /payroll-api
                                                    </code>{" "}
                                                    üzerinden yönlendirir. Port farklıysa{" "}
                                                    <code className="rounded bg-slate-800 px-1 text-[0.65rem]">
                                                        .env
                                                    </code>{" "}
                                                    içinde{" "}
                                                    <code className="rounded bg-slate-800 px-1 text-[0.65rem]">
                                                        VITE_PAYROLL_PROXY_TARGET=http://localhost:PORT
                                                    </code>{" "}
                                                    tanımlayın.
                                                </p>
                                            </div>
                                        ) : overview?.currentSalary ? (
                                            <>
                                                <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
                                                    {formatMoneyTR(
                                                        overview.currentSalary.baseSalary,
                                                        overview.currentSalary.currency || "TRY"
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Geçerlilik:{" "}
                                                    {formatMaybeDateTR(overview.currentSalary.effectiveDate)}
                                                    {overview.currentSalary.createdAt && (
                                                        <>
                                                            {" "}
                                                            · Kayıt:{" "}
                                                            {formatMaybeDateTR(overview.currentSalary.createdAt)}
                                                        </>
                                                    )}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="mt-2 text-sm text-slate-400">
                                                Henüz tanımlı temel maaş yok. Aşağıdan ekleyebilirsiniz.
                                            </p>
                                        )}

                                        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-700/60 pt-4 text-xs">
                                            <div>
                                                <span className="text-slate-500">Bonus kayıtları</span>
                                                <p className="font-semibold text-slate-200">
                                                    {overview?.bonusEntryCount ?? "—"}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Kesinti kayıtları</span>
                                                <p className="font-semibold text-slate-200">
                                                    {overview?.deductionEntryCount ?? "—"}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Bekleyen avans</span>
                                                <p className="font-semibold text-amber-200/90">
                                                    {overview?.pendingAdvanceCount ?? "—"}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-slate-500">Onaylı avans</span>
                                                <p className="font-semibold text-slate-200">
                                                    {overview?.approvedAdvanceCount ?? "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {overview && !overviewError && (
                                    <div className="border-t border-slate-700/60 bg-slate-950/30 px-5 py-4">
                                        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            Son bordro kaydı
                                        </h3>
                                        {overview.lastPayrollYear != null && overview.lastPayrollMonth != null ? (
                                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-500">Dönem</span>
                                                    <p className="font-medium text-white">
                                                        {overview.lastPayrollMonth}/{overview.lastPayrollYear}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Net</span>
                                                    <p className="font-semibold text-emerald-300/90">
                                                        {formatMoneyTR(overview.lastNetSalary)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Brüt (dönem)</span>
                                                    <p className="text-slate-200">
                                                        {formatMoneyTR(overview.lastBaseSalary)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Bonus (dönem)</span>
                                                    <p className="text-emerald-200/80">
                                                        {formatMoneyTR(overview.lastTotalBonus)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Kesinti (dönem)</span>
                                                    <p className="text-amber-200/80">
                                                        {formatMoneyTR(overview.lastTotalDeduction)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Durum</span>
                                                    <p className="text-slate-200">
                                                        {emptyDash(overview.lastPayrollStatus)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Toplam bordro</span>
                                                    <p className="text-slate-200">{overview.payrollRecordCount}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm text-slate-400">
                                                Bu çalışan için henüz oluşturulmuş bordro kaydı yok.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <section className="w-full rounded-2xl border border-blue-500/35 bg-gradient-to-br from-slate-950/90 via-blue-950/20 to-slate-950/90 p-5 shadow-[0_0_32px_rgba(59,130,246,0.12)]">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-base font-semibold tracking-tight text-blue-100">
                                            Dönem bordrosu oluştur
                                        </h3>
                                        <p className="mt-1 max-w-xl text-xs text-slate-400">
                                            Seçilen ay ve yıl için bordro kaydı oluşturur. Aynı çalışan ve dönem için
                                            ikinci kez oluşturulamaz.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={actionLoading === "generate"}
                                        onClick={handleGeneratePayroll}
                                        className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        {actionLoading === "generate" ? "Hesaplanıyor…" : "Dönem bordrosu oluştur"}
                                    </button>
                                </div>
                                <div className="mt-5 flex flex-wrap items-end gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-slate-400">Ay</label>
                                        <select
                                            className="mt-1.5 min-w-[200px] rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-blue-400/70 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                                            value={payrollMonth}
                                            onChange={(e) => setPayrollMonth(e.target.value)}
                                        >
                                            {monthOptions.map((m) => (
                                                <option key={m.value} value={m.value}>
                                                    {m.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-slate-400">Yıl</label>
                                        <select
                                            className="mt-1.5 min-w-[120px] rounded-lg border border-slate-600 bg-slate-900/80 px-3 py-2.5 text-sm text-white focus:border-blue-400/70 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                                            value={payrollYear}
                                            onChange={(e) => setPayrollYear(e.target.value)}
                                        >
                                            {yearOptions.map((y) => (
                                                <option key={y.value} value={y.value}>
                                                    {y.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {lastPayroll && lastPayroll.employeeId === selected.id && (
                                    <div className="mt-5 grid gap-2 rounded-xl border border-blue-500/20 bg-slate-900/60 p-4 text-sm">
                                        <div className="text-xs font-semibold uppercase tracking-wide text-blue-300/90">
                                            Son oluşturulan bordro
                                        </div>
                                        <div className="flex justify-between text-slate-300">
                                            <span>Dönem</span>
                                            <span className="font-medium text-white">
                                                {lastPayroll.month}/{lastPayroll.year}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-slate-300">
                                            <span>Brüt (temel)</span>
                                            <span>{String(lastPayroll.baseSalary)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-300/90">
                                            <span>Toplam bonus</span>
                                            <span>{String(lastPayroll.totalBonus)}</span>
                                        </div>
                                        <div className="flex justify-between text-amber-300/90">
                                            <span>Toplam kesinti</span>
                                            <span>{String(lastPayroll.totalDeduction)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-700 pt-2 text-base font-semibold text-white">
                                            <span>Net</span>
                                            <span>{String(lastPayroll.netSalary)}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">Durum: {lastPayroll.status}</div>
                                    </div>
                                )}
                            </section>

                            <div className="grid gap-4 md:grid-cols-2">
                                <section className="rounded-2xl border border-slate-700/80 bg-slate-950/30 p-5">
                                    <h3 className="text-sm font-semibold text-sky-300">Temel maaş</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Son kayıt, bordro hesaplamasında kullanılan güncel maaştır. USD/EUR/GBP
                                        girildiğinde güncel kurla TRY&apos;ye çevrilerek kaydedilir.
                                    </p>
                                    <div className="mt-4 grid gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400">Tutar</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                                value={baseSalary}
                                                onChange={(e) => setBaseSalary(e.target.value)}
                                                placeholder="Örn. 45000 veya 1500 (USD)"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Para birimi</label>
                                            <select
                                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                            >
                                                {PAYROLL_CURRENCY_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={actionLoading === "salary"}
                                            onClick={handleSaveSalary}
                                            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
                                        >
                                            {actionLoading === "salary" ? "Kaydediliyor..." : "Maaşı kaydet"}
                                        </button>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-slate-700/80 bg-slate-950/30 p-5">
                                    <h3 className="text-sm font-semibold text-emerald-300">Bonus</h3>
                                    <div className="mt-4 grid gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400">Tutar</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                                value={bonusAmount}
                                                onChange={(e) => setBonusAmount(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Açıklama (isteğe bağlı)</label>
                                            <input
                                                type="text"
                                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                                value={bonusDesc}
                                                onChange={(e) => setBonusDesc(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            disabled={actionLoading === "bonus"}
                                            onClick={handleBonus}
                                            className="rounded-lg bg-emerald-700/90 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                                        >
                                            {actionLoading === "bonus" ? "Ekleniyor..." : "Bonus ekle"}
                                        </button>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-slate-700/80 bg-slate-950/30 p-5">
                                    <h3 className="text-sm font-semibold text-amber-300">Kesinti</h3>
                                    <div className="mt-4 grid gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400">Tutar</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                                value={deductionAmount}
                                                onChange={(e) => setDeductionAmount(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Açıklama (isteğe bağlı)</label>
                                            <input
                                                type="text"
                                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                                value={deductionDesc}
                                                onChange={(e) => setDeductionDesc(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            disabled={actionLoading === "deduction"}
                                            onClick={handleDeduction}
                                            className="rounded-lg bg-amber-700/90 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                                        >
                                            {actionLoading === "deduction" ? "Ekleniyor..." : "Kesinti ekle"}
                                        </button>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-slate-700/80 bg-slate-950/30 p-5">
                                    <h3 className="text-sm font-semibold text-violet-300">Maaş avansı</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Talep oluşturulur; onay sonrası bordroya yansır.
                                    </p>
                                    <div className="mt-4 grid gap-3">
                                        <div>
                                            <label className="text-xs text-slate-400">Tutar</label>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                                value={advanceAmount}
                                                onChange={(e) => setAdvanceAmount(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400">Talep tarihi</label>
                                            <input
                                                type="date"
                                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                                value={advanceDate}
                                                onChange={(e) => setAdvanceDate(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            disabled={actionLoading === "advance"}
                                            onClick={handleAdvance}
                                            className="rounded-lg bg-violet-700/90 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
                                        >
                                            {actionLoading === "advance" ? "Gönderiliyor..." : "Avans talep et"}
                                        </button>
                                    </div>
                                </section>
                            </div>

                            <section className="rounded-2xl border border-slate-700/80 bg-slate-950/30 p-5">
                                <h3 className="text-sm font-semibold text-slate-200">Avans onayı</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Veritabanındaki avans kaydının kimliğini girerek onaylayın.
                                </p>
                                <div className="mt-4 flex flex-wrap items-end gap-3">
                                    <div className="min-w-[160px] flex-1">
                                        <label className="text-xs text-slate-400">Avans ID</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-sky-400/70 focus:outline-none"
                                            value={approveAdvanceId}
                                            onChange={(e) => setApproveAdvanceId(e.target.value)}
                                            placeholder="Örn. 12"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        disabled={actionLoading === "approve"}
                                        onClick={handleApproveAdvance}
                                        className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                                    >
                                        {actionLoading === "approve" ? "..." : "Onayla"}
                                    </button>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayrollPage;
