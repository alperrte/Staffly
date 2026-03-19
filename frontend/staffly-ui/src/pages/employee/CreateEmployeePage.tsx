import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import { createEmployee } from "../../services/employeeService";

type CreateEmployeeForm = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    hireDate: string;
    status: string; // ACTIVE | INACTIVE
    gender: string; // MALE | FEMALE
    positionName: string;
    departmentId: number;
};

type DropdownOption = { value: string; label: string };

function DarkDropdown(props: {
    name: string;
    value: string;
    options: DropdownOption[];
    placeholder: string;
    onChange: (value: string) => void;
}) {
    const { value, options, placeholder, onChange } = props;
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const onDocMouseDown = (e: MouseEvent) => {
            if (!wrapperRef.current) return;
            const target = e.target as Node;
            if (!wrapperRef.current.contains(target)) setOpen(false);
        };

        document.addEventListener("mousedown", onDocMouseDown);
        return () => document.removeEventListener("mousedown", onDocMouseDown);
    }, [open]);

    const selected = options.find((o) => o.value === value);
//Push
    const inputClass =
        "block w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 shadow-sm outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30 disabled:opacity-60 disabled:cursor-not-allowed";

    return (
        <div ref={wrapperRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`${inputClass} cursor-pointer text-left flex items-center justify-between`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={selected ? "text-white" : "text-slate-400"}>
                    {selected ? selected.label : placeholder}
                </span>
                <span className="text-slate-400">
                    {open ? "▴" : "▾"}
                </span>
            </button>

            {open && (
                <div className="absolute left-0 right-0 mt-2 z-20 rounded-xl border border-white/10 bg-slate-950/90 shadow-[0_0_45px_rgba(15,23,42,0.9)] overflow-hidden">
                    <div className="p-1">
                        {options.map((opt) => {
                            const active = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                                        active
                                            ? "bg-sky-500/20 text-sky-100"
                                            : "text-slate-200 hover:bg-sky-500/10"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

const CreateEmployeePage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState<CreateEmployeeForm>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        hireDate: "",
        status: "ACTIVE",
        gender: "",
        positionName: "",
        departmentId: 1,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const inputClass =
        "block w-full rounded-xl border border-white/10 bg-slate-900/45 px-3 py-2.5 text-sm text-white placeholder:text-slate-400 shadow-sm outline-none transition focus:border-sky-400/70 focus:ring-1 focus:ring-sky-500/30 disabled:opacity-60 disabled:cursor-not-allowed";

    const labelClass = "text-sm font-medium text-slate-300";

    const birthMax = useMemo(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d.toISOString().split("T")[0];
    }, []);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;

        setError("");
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const isAdult = (birthDate: string) => {
        if (!birthDate) return false;
        const birth = new Date(birthDate);
        if (Number.isNaN(birth.getTime())) return false;

        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age -= 1;
        }
        return age >= 18;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setError("");

            if (!form.firstName.trim()) return setError("Ad zorunludur");
            if (!form.lastName.trim()) return setError("Soyad zorunludur");
            if (!form.email.trim()) return setError("E-posta zorunludur");
            if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Geçerli bir e-posta girin");
            if (!form.phone.trim()) return setError("Telefon zorunludur");
            if (!form.birthDate) return setError("Doğum tarihi zorunludur");
            if (!isAdult(form.birthDate)) return setError("Çalışan en az 18 yaşında olmalıdır");
            if (!form.gender) return setError("Cinsiyet zorunludur");
            if (!form.positionName.trim()) return setError("Pozisyon zorunludur");

            setLoading(true);
            await createEmployee(form);

            navigate("/app/employees");
        } catch (err) {
            console.error(err);
            setError("Çalışan oluşturulamadı");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];
        setForm((prev) => ({
            ...prev,
            hireDate: today,
        }));
    }, []);

    const genderOptions: DropdownOption[] = [
        { value: "MALE", label: "Erkek" },
        { value: "FEMALE", label: "Kadın" },
    ];

    const statusOptions: DropdownOption[] = [
        { value: "ACTIVE", label: "Aktif" },
        { value: "INACTIVE", label: "Pasif" },
    ];

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
                    <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-900/45 p-7 rounded-2xl border border-white/10 shadow-[0_0_45px_rgba(15,23,42,0.7)] w-full"
                >
                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Ad</label>
                        <input
                            name="firstName"
                            placeholder="John"
                            value={form.firstName}
                            onChange={handleChange}
                            className={inputClass}
                            autoComplete="given-name"
                            required
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
                            required
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
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Telefon</label>
                        <input
                            name="phone"
                            placeholder="+90..."
                            value={form.phone}
                            onChange={handleChange}
                            className={inputClass}
                            autoComplete="tel"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Doğum Tarihi</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={form.birthDate}
                            onChange={handleChange}
                            className={inputClass}
                            max={birthMax}
                            required
                        />
                        <p className="text-xs text-slate-400">Sistem tarihine göre 18+ olmalıdır</p>
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
                        <label className={labelClass}>Pozisyon</label>
                        <input
                            name="positionName"
                            placeholder="Software Engineer"
                            value={form.positionName}
                            onChange={handleChange}
                            className={inputClass}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className={labelClass}>Durum</label>
                        <DarkDropdown
                            name="status"
                            value={form.status}
                            options={statusOptions}
                            placeholder="Durum seçin"
                            onChange={(v) => {
                                setError("");
                                setForm((prev) => ({ ...prev, status: v }));
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-1">
                        <label className={labelClass}>İşe Başlama Tarihi</label>
                        <input
                            type="date"
                            name="hireDate"
                            value={form.hireDate}
                            readOnly
                            className={`${inputClass} opacity-70 cursor-not-allowed`}
                        />
                    </div>

                    <div className="md:col-span-2 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 disabled:hover:bg-sky-500/50 px-4 py-3 text-sm font-semibold text-white transition shadow-[0_0_22px_rgba(56,189,248,0.28)]"
                        >
                            {loading ? "Oluşturuluyor..." : "Çalışan Oluştur"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmployeePage;