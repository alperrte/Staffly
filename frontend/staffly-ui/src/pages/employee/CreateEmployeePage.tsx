import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import {
    createEmployee,
    getDepartments,
    getSubDepartmentsByDepartmentId,
    getPositionsBySubDepartmentId,
    uploadEmployeeProfileImage,
} from "../../services/employeeService";
import { MARITAL_STATUS_OPTIONS } from "../../types/employeeTypes";

import type {
    Department,
    SubDepartment,
    DepartmentPosition,
} from "../../types/employeeTypes";

type CreateEmployeeForm = {
    firstName: string;
    lastName: string;
    email: string;
    phoneCode: string;
    phoneNumber: string;
    birthDate: string;
    hireDate: string;
    gender: string;
    positionId: number;
    departmentId: number;
    subDepartmentId: number;
    medeniDurum?: string;
    tc?: string;
    profileFile?: File | null;
};

type DropdownOption = { value: string; label: string };

const PHONE_NUMBER_LENGTH = 10;

function PhoneInput({
    number,
    onNumberChange,
}: {
    number: string;
    onNumberChange: (v: string) => void;
}) {
    return (
        <div
            className="flex overflow-hidden rounded-xl border border-white/10 bg-slate-900/45 transition focus-within:border-sky-400/70 focus-within:ring-1 focus-within:ring-sky-500/30"
        >
            <div className="flex shrink-0 items-center border-r border-white/10 px-3 py-2.5 text-sm font-semibold text-white">
                +90
            </div>

            <input
                type="tel"
                value={number}
                onChange={(e) => onNumberChange(e.target.value.replace(/\D/g, "").slice(0, PHONE_NUMBER_LENGTH))}
                placeholder="5xx xxx xx xx"
                inputMode="numeric"
                maxLength={PHONE_NUMBER_LENGTH}
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none"
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
                className={`${base} cursor-pointer text-left flex items-center justify-between gap-2 ${
                    disabled ? "opacity-40 cursor-not-allowed" : "hover:border-sky-400/40"
                }`}
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
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                    opt.value === value
                                        ? "bg-sky-500/20 text-sky-100"
                                        : "text-slate-200 hover:bg-sky-500/10"
                                }`}
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
    const [viewYear, setViewYear] = useState(
        () => parsed?.getFullYear() ?? today.getFullYear() - 25
    );
    const [viewMonth, setViewMonth] = useState(() => parsed?.getMonth() ?? today.getMonth());

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const monthNames = [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
    ];
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
        parsed?.getFullYear() === viewYear &&
        parsed?.getMonth() === viewMonth &&
        parsed?.getDate() === day;

    const prevMonth = () =>
        viewMonth === 0 ? (setViewMonth(11), setViewYear((y) => y - 1)) : setViewMonth((m) => m - 1);

    const nextMonth = () =>
        viewMonth === 11 ? (setViewMonth(0), setViewYear((y) => y + 1)) : setViewMonth((m) => m + 1);

    const display = parsed
        ? `${String(parsed.getDate()).padStart(2, "0")}.${String(
              parsed.getMonth() + 1
          ).padStart(2, "0")}.${parsed.getFullYear()}`
        : "";

    const yearRange = Array.from({ length: 100 }, (_, i) => today.getFullYear() - i);

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="block w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-left shadow-sm outline-none transition hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30 flex items-center justify-between gap-2"
            >
                <span className={display ? "text-white" : "text-slate-400"}>
                    {display || "GG.AA.YYYY"}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-slate-500 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </button>

            {open && (
                <div className="absolute left-0 z-30 mt-1.5 w-[17rem] rounded-2xl border border-white/10 bg-slate-950 shadow-[0_8px_48px_rgba(0,0,0,0.8)] p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition shrink-0"
                        >
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-1.5 flex-1 justify-center">
                            <select
                                value={viewMonth}
                                onChange={(e) => setViewMonth(Number(e.target.value))}
                                className="bg-slate-800/80 text-white text-xs rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer"
                            >
                                {monthNames.map((m, i) => (
                                    <option key={i} value={i}>
                                        {m}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={viewYear}
                                onChange={(e) => setViewYear(Number(e.target.value))}
                                className="bg-slate-800/80 text-white text-xs rounded-lg px-2 py-1 border border-white/10 outline-none cursor-pointer"
                            >
                                {yearRange.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition shrink-0"
                        >
                            <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 mb-0.5">
                        {dayNames.map((d) => (
                            <div key={d} className="text-center text-[10px] text-slate-600 py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-0.5">
                        {cells.map((day, i) => {
                            if (!day) return <div key={`e-${i}`} />;
                            const disabled = isDayDisabled(day);
                            const sel = isSelected(day);

                            return (
                                <button
                                    key={`d-${day}`}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                        onChange(toISO(viewYear, viewMonth, day));
                                        setOpen(false);
                                    }}
                                    className={`text-center text-xs py-[7px] rounded-lg transition font-medium
                                        ${sel ? "bg-sky-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]" : ""}
                                        ${!sel && !disabled ? "text-slate-300 hover:bg-sky-500/20 hover:text-sky-200" : ""}
                                        ${disabled ? "text-slate-700 cursor-not-allowed" : "cursor-pointer"}
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange("");
                                setOpen(false);
                            }}
                            className="mt-3 w-full text-[11px] text-slate-500 hover:text-slate-300 transition text-center"
                        >
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
        firstName: "",
        lastName: "",
        email: "",
        phoneCode: "+90",
        phoneNumber: "",
        birthDate: "",
        hireDate: "",
        gender: "",
        positionId: 0,
        departmentId: 0,
        subDepartmentId: 0,
        medeniDurum: "",
        tc: "",
        profileFile: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
    const [positions, setPositions] = useState<DepartmentPosition[]>([]);

    const inputClass =
        "create-employee-input block w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 shadow-sm outline-none transition hover:border-sky-400/40 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30";
    const labelClass = "text-sm font-medium text-slate-300";

    const birthMax = useMemo(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d.toISOString().split("T")[0];
    }, []);

    const departmentOptions: DropdownOption[] = useMemo(
        () => departments.map((d) => ({ value: String(d.id), label: d.name })),
        [departments]
    );

    const subDeptOptions: DropdownOption[] = useMemo(
        () => subDepartments.map((s) => ({ value: String(s.id), label: s.name })),
        [subDepartments]
    );

    const positionOptions: DropdownOption[] = useMemo(
        () => positions.map((p) => ({ value: String(p.id), label: p.name })),
        [positions]
    );

    const genderOptions: DropdownOption[] = [
        { value: "MALE", label: "Erkek" },
        { value: "FEMALE", label: "Kadın" },
    ];

    const medeniOptions: DropdownOption[] = MARITAL_STATUS_OPTIONS.map((o) => ({
        value: o.value,
        label: o.label,
    }));

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
        const { name, value } = e.target;
        setError("");
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDeptChange = async (v: string) => {
        const departmentId = Number(v);

        setError("");
        setForm((prev) => ({
            ...prev,
            departmentId,
            subDepartmentId: 0,
            positionId: 0,
        }));

        setSubDepartments([]);
        setPositions([]);

        if (!departmentId) return;

        try {
            const data = await getSubDepartmentsByDepartmentId(departmentId);
            setSubDepartments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Alt departmanlar yüklenemedi");
        }
    };

    const handleSubDeptChange = async (v: string) => {
        const subDepartmentId = Number(v);

        setError("");
        setForm((prev) => ({
            ...prev,
            subDepartmentId,
            positionId: 0,
        }));

        setPositions([]);

        if (!subDepartmentId) return;

        try {
            const data = await getPositionsBySubDepartmentId(subDepartmentId);
            setPositions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Pozisyonlar yüklenemedi");
        }
    };

    const handlePositionChange = (v: string) => {
        setError("");
        setForm((prev) => ({
            ...prev,
            positionId: Number(v),
        }));
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
        if (!form.medeniDurum) return setError("Medeni durum zorunludur");
        if (!form.tc || !/^[0-9]{11}$/.test(form.tc.trim())) return setError("TC kimlik no zorunludur (11 haneli rakam)");
        if (!isAdult(form.birthDate)) return setError("Çalışan en az 18 yaşında olmalıdır");
        if (!form.gender) return setError("Cinsiyet zorunludur");
        if (!form.departmentId) return setError("Departman zorunludur");
        if (!form.subDepartmentId) return setError("Alt departman zorunludur");
        if (!form.positionId) return setError("Pozisyon zorunludur");

        try {
            setLoading(true);

            const created = await createEmployee({
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                phone: `${form.phoneCode}${form.phoneNumber.trim()}`,
                birthDate: form.birthDate,
                hireDate: form.hireDate,
                gender: form.gender,
                medeniDurum: form.medeniDurum,
                tc: form.tc,
                departmentId: form.departmentId,
                positionId: form.positionId,
            });

            if (form.profileFile && created && created.id) {
                try {
                    await uploadEmployeeProfileImage(created.id, form.profileFile);
                } catch (err) {
                    console.warn("Profil fotoğrafı yüklenemedi", err);
                }
            }

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
        setForm((prev) => ({ ...prev, hireDate: today }));
    }, []);

    useEffect(() => {
        getDepartments()
            .then((data) => {
                setDepartments(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
                setError("Departmanlar yüklenemedi");
            });
    }, []);

    const StepBadge = ({ step, label, done }: { step: number; label: string; done: boolean }) => (
        <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                done ? "text-sky-400" : "text-slate-500"
            }`}
        >
            <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold
                ${done ? "bg-sky-500 text-white" : "bg-slate-700 text-slate-400"}`}
            >
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
                    <p className="text-slate-400 text-sm mt-1">
                        Detayları doldurun ve yeni bir çalışan kaydı oluşturun.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
                        <svg
                            className="w-4 h-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                            />
                        </svg>
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/45 p-7 rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(15,23,42,0.6)] w-full"
                >
                    <div className="md:col-span-2">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
                            Kişisel Bilgiler
                        </h2>
                        <div className="h-px bg-slate-700/60" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Ad</label>
                        <input
                            name="firstName"
                            placeholder="John"
                            value={form.firstName}
                            onChange={handleChange}
                            className={inputClass}
                            autoComplete="given-name"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Soyad</label>
                        <input
                            name="lastName"
                            placeholder="Doe"
                            value={form.lastName}
                            onChange={handleChange}
                            className={inputClass}
                            autoComplete="family-name"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>E-posta</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="ornek@mail.com"
                            value={form.email}
                            onChange={handleChange}
                            className={inputClass}
                            autoComplete="email"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Telefon</label>
                        <PhoneInput
                            number={form.phoneNumber}
                            onNumberChange={(v) => {
                                setError("");
                                setForm((p) => ({ ...p, phoneNumber: v }));
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Doğum Tarihi</label>
                        <DatePicker
                            value={form.birthDate}
                            max={birthMax}
                            onChange={(v) => {
                                setError("");
                                setForm((prev) => ({ ...prev, birthDate: v }));
                            }}
                        />
                        <p className="text-xs text-slate-500">
                            Çalışan en az 18 yaşında olmalıdır
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Cinsiyet</label>
                        <DarkDropdown
                            name="gender"
                            value={form.gender}
                            options={genderOptions}
                            placeholder="Cinsiyet seçin"
                            onChange={(v) => {
                                setError("");
                                setForm((prev) => ({ ...prev, gender: v }));
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Medeni Durum</label>
                        <DarkDropdown
                            name="medeniDurum"
                            value={form.medeniDurum || ""}
                            options={medeniOptions}
                            placeholder="Medeni durum seçin"
                            onChange={(v) => {
                                setError("");
                                setForm((prev) => ({ ...prev, medeniDurum: v }));
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>TC Kimlik No</label>
                        <input
                            name="tc"
                            placeholder="11 haneli TC"
                            value={form.tc}
                            maxLength={11}
                            onChange={(e) => {
                                setError("");
                                const v = e.target.value.replace(/[^0-9]/g, "");
                                setForm((prev) => ({ ...prev, tc: v.slice(0, 11) }));
                            }}
                            className={inputClass}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Profil Fotoğrafı (opsiyonel)</label>
                        <label className="relative cursor-pointer inline-block w-full">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setError("");
                                    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                                    setForm((prev) => ({ ...prev, profileFile: f }));
                                }}
                                className="hidden"
                            />
                            <span className={`${inputClass} block cursor-pointer text-slate-400`}>
                                {form.profileFile ? form.profileFile.name : "Dosya seçmek için tıklayın"}
                            </span>
                        </label>
                    </div>

                    <div className="md:col-span-2 mt-2">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                Organizasyon
                            </h2>
                            <div className="flex items-center gap-3">
                                <StepBadge step={1} label="Departman" done={!!form.departmentId} />
                                <span className="text-slate-700">›</span>
                                <StepBadge step={2} label="Alt Departman" done={!!form.subDepartmentId} />
                                <span className="text-slate-700">›</span>
                                <StepBadge step={3} label="Pozisyon" done={!!form.positionId} />
                            </div>
                        </div>
                        <div className="h-px bg-slate-700/60" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Departman</label>
                        <DarkDropdown
                            name="departmentId"
                            value={form.departmentId ? String(form.departmentId) : ""}
                            options={departmentOptions}
                            placeholder="Departman seçin"
                            onChange={handleDeptChange}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={`${labelClass} flex items-center gap-2`}>
                            Alt Departman
                            {!form.departmentId && (
                                <span className="text-xs text-slate-600 font-normal">
                                    — önce departman seçin
                                </span>
                            )}
                        </label>
                        <DarkDropdown
                            name="subDepartmentId"
                            value={form.subDepartmentId ? String(form.subDepartmentId) : ""}
                            options={subDeptOptions}
                            placeholder={
                                !form.departmentId
                                    ? "Önce departman seçin"
                                    : subDeptOptions.length
                                    ? "Alt departman seçin"
                                    : "Alt departman bulunamadı"
                            }
                            disabled={!form.departmentId || subDeptOptions.length === 0}
                            onChange={handleSubDeptChange}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={`${labelClass} flex items-center gap-2`}>
                            Pozisyon
                            {!form.subDepartmentId && (
                                <span className="text-xs text-slate-600 font-normal">
                                    — önce alt departman seçin
                                </span>
                            )}
                        </label>
                        <DarkDropdown
                            name="positionId"
                            value={form.positionId ? String(form.positionId) : ""}
                            options={positionOptions}
                            placeholder={
                                !form.subDepartmentId
                                    ? "Önce alt departman seçin"
                                    : positionOptions.length
                                    ? "Pozisyon seçin"
                                    : "Pozisyon bulunamadı"
                            }
                            disabled={!form.subDepartmentId || positionOptions.length === 0}
                            onChange={handlePositionChange}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>İşe Başlama Tarihi</label>
                        <input
                            type="date"
                            name="hireDate"
                            value={form.hireDate}
                            readOnly
                            className={`${inputClass} opacity-50 cursor-not-allowed`}
                        />
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/40 px-4 py-3 text-sm font-semibold text-white transition shadow-[0_0_28px_rgba(56,189,248,0.25)] hover:shadow-[0_0_36px_rgba(56,189,248,0.35)]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        />
                                    </svg>
                                    Oluşturuluyor...
                                </span>
                            ) : (
                                "Çalışan Oluştur"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployeePage;