import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { createEmployee } from "../../services/employeeService";
import { getDepartments } from "../../services/departmentService";

type CreateEmployeeForm = {
    firstName: string;
    lastName: string;
    email: string;
    phoneCode: string;
    phoneNumber: string;
    birthDate: string;
    hireDate: string;
    gender: string;
    positionName: string;
    departmentId: number;
    subDepartmentId: number;
};

type DepartmentPositionResponse = { id: number; name: string; description?: string };
type SubDepartmentResponse = {
    id: number;
    name: string;
    description?: string;
    managerId?: number;
    positions?: DepartmentPositionResponse[];
};
type DepartmentResponse = {
    id: number;
    name: string;
    description?: string;
    managerId?: number;
    subDepartments?: SubDepartmentResponse[];
};

type DropdownOption = { value: string; label: string };

/* ══════════════════════════════════════════════════════════
   Phone Codes
══════════════════════════════════════════════════════════ */
const PHONE_CODES = [
    { code: "+90",  label: "TR (+90)"},
    { code: "+1",   label: "US (+1)"},
    { code: "+44",  label: "UK (+44)"},
    { code: "+49",  label: "DE (+49)"},
    { code: "+33",  label: "FR (+33)"},
    { code: "+39",  label: "IT (+39)"},
    { code: "+31",  label: "NL (+31)" },
    { code: "+34",  label: "ES (+34)" },
    { code: "+7",   label: "RU (+7)"},
    { code: "+971", label: "AE (+971)"},
];

/* ══════════════════════════════════════════════════════════
   PhoneInput
══════════════════════════════════════════════════════════ */
function PhoneInput(props: {
    code: string;
    number: string;
    onCodeChange: (v: string) => void;
    onNumberChange: (v: string) => void;
}) {
    const { code, number, onCodeChange, onNumberChange } = props;
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [open]);

    const selected = PHONE_CODES.find(c => c.code === code) ?? PHONE_CODES[0];

    return (
        <div
            ref={ref}
            className="relative flex rounded-xl border border-white/10 bg-slate-900/45 overflow-visible focus-within:border-sky-400/70 focus-within:ring-1 focus-within:ring-sky-500/30 transition"
        >
            {/* Code selector */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2.5 border-r border-white/10 text-sm text-white hover:bg-white/5 transition shrink-0 rounded-l-xl"
            >
                <span className="text-base leading-none">{selected.flag}</span>
                <span className="text-slate-200 whitespace-nowrap">{selected.label}</span>
                <span className="text-slate-500 text-xs ml-0.5">{open ? "▴" : "▾"}</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute left-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-white/10 bg-slate-950 shadow-[0_8px_48px_rgba(0,0,0,0.8)]">
                    <div className="p-1.5 max-h-56 overflow-y-auto">
                        {PHONE_CODES.map(c => (
                            <button
                                key={c.code}
                                type="button"
                                onClick={() => { onCodeChange(c.code); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2.5 transition
                                    ${c.code === code ? "bg-sky-500/20 text-sky-100 font-medium" : "text-slate-200 hover:bg-sky-500/10"}`}
                            >
                                <span className="text-base">{c.flag}</span>
                                <span>{c.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Number input */}
            <input
                type="tel"
                value={number}
                onChange={e => onNumberChange(e.target.value.replace(/[^\d\s\-]/g, ""))}
                placeholder="5xx xxx xx xx"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none rounded-r-xl"
                autoComplete="tel-national"
            />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   DarkDropdown
══════════════════════════════════════════════════════════ */
function DarkDropdown(props: {
    name: string;
    value: string;
    options: DropdownOption[];
    placeholder: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    const { value, options, placeholder, onChange, disabled } = props;
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const selected = options.find((o) => o.value === value);
    const base =
        "block w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30";

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => !disabled && setOpen((v) => !v)}
                disabled={disabled}
                className={`${base} cursor-pointer text-left flex items-center justify-between gap-2 ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-sky-400/40"}`}
            >
                <span className={selected ? "text-white" : "text-slate-400"}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className="text-slate-500 shrink-0">{open ? "▴" : "▾"}</span>
            </button>

            {open && (
                <div className="absolute left-0 right-0 mt-1.5 z-30 rounded-xl border border-white/10 bg-slate-950 shadow-[0_8px_48px_rgba(0,0,0,0.7)] overflow-hidden">
                    <div className="p-1 max-h-56 overflow-y-auto overscroll-contain">
                        {options.length === 0 && (
                            <p className="px-3 py-2 text-xs text-slate-500">Seçenek bulunamadı</p>
                        )}
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${opt.value === value ? "bg-sky-500/20 text-sky-100" : "text-slate-200 hover:bg-sky-500/10"}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   DatePicker
══════════════════════════════════════════════════════════ */
function DatePicker(props: {
    value: string;
    onChange: (val: string) => void;
    max?: string;
    min?: string;
}) {
    const { value, onChange, max, min } = props;
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const today = new Date();
    const maxDate = max ? new Date(max + "T00:00:00") : null;
    const minDate = min ? new Date(min + "T00:00:00") : null;

    const parsed = value ? new Date(value + "T00:00:00") : null;
    const [viewYear, setViewYear] = useState(() => parsed?.getFullYear() ?? today.getFullYear() - 25);
    const [viewMonth, setViewMonth] = useState(() => parsed?.getMonth() ?? today.getMonth());

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const dayNames = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

    const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    const toISO = (y: number, m: number, d: number) =>
        `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const isDayDisabled = (day: number) => {
        const d = new Date(viewYear, viewMonth, day);
        if (maxDate && d > maxDate) return true;
        if (minDate && d < minDate) return true;
        return false;
    };

    const isSelected = (day: number) =>
        parsed?.getFullYear() === viewYear && parsed?.getMonth() === viewMonth && parsed?.getDate() === day;

    const prevMonth = () => viewMonth === 0 ? (setViewMonth(11), setViewYear(y => y - 1)) : setViewMonth(m => m - 1);
    const nextMonth = () => viewMonth === 11 ? (setViewMonth(0), setViewYear(y => y + 1)) : setViewMonth(m => m + 1);

    const display = parsed
        ? `${String(parsed.getDate()).padStart(2, "0")}.${String(parsed.getMonth() + 1).padStart(2, "0")}.${parsed.getFullYear()}`
        : "";

    const yearRange = Array.from({ length: 100 }, (_, i) => today.getFullYear() - i);

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="block w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-left shadow-sm outline-none transition hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30 flex items-center justify-between gap-2"
            >
                <span className={display ? "text-white" : "text-slate-400"}>{display || "GG.AA.YYYY"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 z-30 mt-1.5 w-[17rem] rounded-2xl border border-white/10 bg-slate-950 shadow-[0_8px_48px_rgba(0,0,0,0.8)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <div className="flex items-center gap-1.5 flex-1 justify-center">
                            <select value={viewMonth} onChange={e => setViewMonth(Number(e.target.value))}
                                className="bg-slate-800/80 text-white text-xs rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer">
                                {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select value={viewYear} onChange={e => setViewYear(Number(e.target.value))}
                                className="bg-slate-800/80 text-white text-xs rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer">
                                {yearRange.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-0.5">
                        {dayNames.map(d => <div key={d} className="text-center text-[10px] text-slate-600 py-1">{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-y-0.5">
                        {cells.map((day, i) => {
                            if (!day) return <div key={`e-${i}`} />;
                            const disabled = isDayDisabled(day);
                            const sel = isSelected(day);
                            return (
                                <button key={`d-${day}`} type="button" disabled={disabled}
                                    onClick={() => { onChange(toISO(viewYear, viewMonth, day)); setOpen(false); }}
                                    className={`text-center text-xs py-[7px] rounded-lg transition font-medium
                                        ${sel ? "bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]" : ""}
                                        ${!sel && !disabled ? "text-slate-300 hover:bg-sky-500/20 hover:text-sky-200" : ""}
                                        ${disabled ? "text-slate-700 cursor-not-allowed" : "cursor-pointer"}
                                    `}>
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {value && (
                        <button type="button" onClick={() => { onChange(""); setOpen(false); }}
                            className="mt-3 w-full text-[11px] text-slate-500 hover:text-slate-300 transition text-center">
                            Temizle
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   CreateEmployeePage
══════════════════════════════════════════════════════════ */
const CreateEmployeePage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<CreateEmployeeForm>({
        firstName: "", lastName: "", email: "",
        phoneCode: "+90", phoneNumber: "",
        birthDate: "", hireDate: "", gender: "",
        positionName: "", departmentId: 0, subDepartmentId: 0,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [departments, setDepartments] = useState<DepartmentResponse[]>([]);

    const inputClass =
        "block w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 shadow-sm outline-none transition hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30";
    const labelClass = "text-sm font-medium text-slate-300";

    const birthMax = useMemo(() => {
        const d = new Date(); d.setFullYear(d.getFullYear() - 18);
        return d.toISOString().split("T")[0];
    }, []);

    const departmentOptions: DropdownOption[] = useMemo(
        () => departments.map(d => ({ value: String(d.id), label: d.name })),
        [departments]
    );

    const selectedDept = useMemo(
        () => departments.find(d => d.id === form.departmentId) ?? null,
        [departments, form.departmentId]
    );

    const subDeptOptions: DropdownOption[] = useMemo(
        () => (selectedDept?.subDepartments ?? []).map(s => ({ value: String(s.id), label: s.name })),
        [selectedDept]
    );

    const selectedSubDept = useMemo(
        () => (selectedDept?.subDepartments ?? []).find(s => s.id === form.subDepartmentId) ?? null,
        [selectedDept, form.subDepartmentId]
    );

    const positionOptions: DropdownOption[] = useMemo(
        () => (selectedSubDept?.positions ?? []).map(p => ({ value: p.name, label: p.name })),
        [selectedSubDept]
    );

    const genderOptions: DropdownOption[] = [
        { value: "MALE", label: "Erkek" },
        { value: "FEMALE", label: "Kadın" },
    ];

    const isAdult = (birthDate: string) => {
        if (!birthDate) return false;
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return false;
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age >= 18;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setError("");
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if (!form.firstName.trim()) return setError("Ad zorunludur");
        if (!form.lastName.trim()) return setError("Soyad zorunludur");
        if (!form.email.trim()) return setError("E-posta zorunludur");
        if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Geçerli bir e-posta girin");
        if (!form.phoneNumber.trim()) return setError("Telefon zorunludur");
        if (!form.birthDate) return setError("Doğum tarihi zorunludur");
        if (!isAdult(form.birthDate)) return setError("Çalışan en az 18 yaşında olmalıdır");
        if (!form.gender) return setError("Cinsiyet zorunludur");
        if (!form.departmentId) return setError("Departman zorunludur");
        if (!form.subDepartmentId) return setError("Alt departman zorunludur");
        if (!form.positionName.trim()) return setError("Pozisyon zorunludur");

        try {
            setLoading(true);
            await createEmployee({
                ...form,
                phone: `${form.phoneCode}${form.phoneNumber.trim()}`,
                status: "ACTIVE",
            });
            navigate("/app/employees", {
                state: {
                    employeeCreated: true,
                    createdEmployeeName: `${form.firstName} ${form.lastName}`.trim(),
                },
            });
        } catch (err) {
            console.error(err);
            setError("Çalışan oluşturulamadı");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setForm(prev => ({ ...prev, hireDate: today }));
    }, []);

    useEffect(() => {
        getDepartments()
            .then((data: unknown) => {
                const list: DepartmentResponse[] = Array.isArray(data) ? data : (data as any)?.content ?? [];
                setDepartments(list);
            })
            .catch(console.error);
    }, []);

    const handleDeptChange = (v: string) => {
        setError("");
        setForm(prev => ({ ...prev, departmentId: Number(v), subDepartmentId: 0, positionName: "" }));
    };
    const handleSubDeptChange = (v: string) => {
        setError("");
        setForm(prev => ({ ...prev, subDepartmentId: Number(v), positionName: "" }));
    };
    const handlePositionChange = (v: string) => {
        setError("");
        setForm(prev => ({ ...prev, positionName: v }));
    };

    const StepBadge = ({ step, label, done }: { step: number; label: string; done: boolean }) => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${done ? "text-sky-400" : "text-slate-500"}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                ${done ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                {done ? "✓" : step}
            </span>
            {label}
        </span>
    );

    return (
        <div className="w-full px-3 sm:px-6">
            <div className="max-w-none w-full mx-auto">
                <div className="mb-6 mt-2">
                    <h1 className="text-2xl font-semibold">Çalışan Oluştur</h1>
                    <p className="text-slate-400 text-sm mt-1">Detayları doldurun ve yeni bir çalışan kaydı oluşturun.</p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/45 p-7 rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(15,23,42,0.6)] w-full">

                    {/* ── Kişisel Bilgiler ── */}
                    <div className="md:col-span-2">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Kişisel Bilgiler</h2>
                        <div className="h-px bg-slate-700/60" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Ad</label>
                        <input name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} className={inputClass} autoComplete="given-name" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Soyad</label>
                        <input name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} className={inputClass} autoComplete="family-name" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>E-posta</label>
                        <input type="email" name="email" placeholder="ornek@mail.com" value={form.email} onChange={handleChange} className={inputClass} autoComplete="email" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Telefon</label>
                        <PhoneInput
                            code={form.phoneCode}
                            number={form.phoneNumber}
                            onCodeChange={v => { setError(""); setForm(p => ({ ...p, phoneCode: v })); }}
                            onNumberChange={v => { setError(""); setForm(p => ({ ...p, phoneNumber: v })); }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Doğum Tarihi</label>
                        <DatePicker value={form.birthDate} max={birthMax}
                            onChange={(v) => { setError(""); setForm(prev => ({ ...prev, birthDate: v })); }} />
                        <p className="text-xs text-slate-500">Çalışan en az 18 yaşında olmalıdır</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Cinsiyet</label>
                        <DarkDropdown name="gender" value={form.gender} options={genderOptions} placeholder="Cinsiyet seçin"
                            onChange={(v) => { setError(""); setForm(prev => ({ ...prev, gender: v })); }} />
                    </div>

                    {/* ── Organizasyon ── */}
                    <div className="md:col-span-2 mt-2">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Organizasyon</h2>
                            <div className="flex items-center gap-3">
                                <StepBadge step={1} label="Departman" done={!!form.departmentId} />
                                <span className="text-slate-700">›</span>
                                <StepBadge step={2} label="Alt Departman" done={!!form.subDepartmentId} />
                                <span className="text-slate-700">›</span>
                                <StepBadge step={3} label="Pozisyon" done={!!form.positionName} />
                            </div>
                        </div>
                        <div className="h-px bg-slate-700/60" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Departman</label>
                        <DarkDropdown name="departmentId"
                            value={form.departmentId ? String(form.departmentId) : ""}
                            options={departmentOptions}
                            placeholder="Departman seçin"
                            onChange={handleDeptChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={`${labelClass} flex items-center gap-2`}>
                            Alt Departman
                            {!form.departmentId && <span className="text-xs text-slate-600 font-normal">— önce departman seçin</span>}
                        </label>
                        <DarkDropdown name="subDepartmentId"
                            value={form.subDepartmentId ? String(form.subDepartmentId) : ""}
                            options={subDeptOptions}
                            placeholder={!form.departmentId ? "Önce departman seçin" : subDeptOptions.length ? "Alt departman seçin" : "Alt departman bulunamadı"}
                            disabled={!form.departmentId || subDeptOptions.length === 0}
                            onChange={handleSubDeptChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={`${labelClass} flex items-center gap-2`}>
                            Pozisyon
                            {!form.subDepartmentId && <span className="text-xs text-slate-600 font-normal">— önce alt departman seçin</span>}
                        </label>
                        <DarkDropdown name="positionName"
                            value={form.positionName}
                            options={positionOptions}
                            placeholder={!form.subDepartmentId ? "Önce alt departman seçin" : positionOptions.length ? "Pozisyon seçin" : "Pozisyon bulunamadı"}
                            disabled={!form.subDepartmentId || positionOptions.length === 0}
                            onChange={handlePositionChange} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>İşe Başlama Tarihi</label>
                        <input type="date" name="hireDate" value={form.hireDate} readOnly
                            className={`${inputClass} opacity-50 cursor-not-allowed`} />
                    </div>

                    {/* ── Submit ── */}
                    <div className="md:col-span-2 pt-2">
                        <button type="submit" disabled={loading}
                            className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/40 px-4 py-3 text-sm font-semibold text-white transition shadow-[0_0_28px_rgba(56,189,248,0.25)] hover:shadow-[0_0_36px_rgba(56,189,248,0.35)]">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Oluşturuluyor...
                                </span>
                            ) : "Çalışan Oluştur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployeePage;