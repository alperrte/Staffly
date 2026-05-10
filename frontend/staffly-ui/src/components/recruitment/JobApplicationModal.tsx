import { useRef, useState } from "react";
import {
    ArrowRight,
    CheckCircle2,
    FileText,
    Info,
    ShieldCheck,
    UploadCloud,
    X,
    ArrowLeft,
} from "lucide-react";
import { createApplication } from "../../services/applicationService";
import type { JobPosting } from "../../types/loginPageTypes";

type NoticeType = "success" | "error" | "confirm" | null;

type NoticeState = {
    type: NoticeType;
    title: string;
    message: string;
};

const COUNTRY_CODES = [
    { code: "+90", label: "TR (+90)" },
    { code: "+1", label: "US (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+49", label: "DE (+49)" },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const nameRegex = /^[A-Za-zÀ-ž\s]+$/;
const phoneRegex = /^[0-9]{7,14}$/;

const JobApplicationModal = ({
                                 job,
                                 onClose,
                                 onBack,
                             }: {
    job: JobPosting;
    onClose: () => void;
    onBack: () => void;
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [selectedCountryCode, setSelectedCountryCode] = useState("+90");
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [notice, setNotice] = useState<NoticeState>({
        type: null,
        title: "",
        message: "",
    });

    const isPersonalInfoCompleted =
        form.firstName.trim() &&
        form.lastName.trim() &&
        emailRegex.test(form.email) &&
        phoneRegex.test(form.phone);

    const isCvCompleted = Boolean(cvFile);

    const isConfirmStepActive = notice.type === "confirm";

    const isCompletedStepActive = notice.type === "success";

    const steps = [
        {
            number: 1,
            label: "Kişisel Bilgiler",
            active: !isPersonalInfoCompleted,
            completed: Boolean(isPersonalInfoCompleted),
        },
        {
            number: 2,
            label: "CV Yükleme",
            active: Boolean(isPersonalInfoCompleted) && !isCvCompleted,
            completed: isCvCompleted,
        },
        {
            number: 3,
            label: "Ek Bilgiler",
            active: false,
            completed: Boolean(isPersonalInfoCompleted) && isCvCompleted,
        },
        {
            number: 4,
            label: "Onay",
            active: isConfirmStepActive,
            completed: isConfirmStepActive || isCompletedStepActive,
        },
        {
            number: 5,
            label: "Tamamlandı",
            active: isCompletedStepActive,
            completed: isCompletedStepActive,
        },
    ];



    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const applicationHint = !isPersonalInfoCompleted
        ? "Kişisel bilgilerinizi eksiksiz doldurun."
        : !isCvCompleted
            ? "CV dosyanızı PDF formatında yükleyin."
            : "Bilgiler hazır. Başvurunuzu onaylayarak gönderebilirsiniz.";


    const setField = (name: string, value: string) => {
        if (name === "phone") {
            value = value.replace(/\D/g, "");
        }

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "firstName" || name === "lastName") {
            setFieldErrors((prev) => ({
                ...prev,
                [name]:
                    value && !nameRegex.test(value)
                        ? "Bu alanda sayı veya özel karakter olamaz."
                        : "",
            }));
        }

        if (name === "email") {
            setFieldErrors((prev) => ({
                ...prev,
                email:
                    value && !emailRegex.test(value)
                        ? "Geçerli bir e-posta adresi girin."
                        : "",
            }));
        }

        if (name === "phone") {
            setFieldErrors((prev) => ({
                ...prev,
                phone:
                    value && !phoneRegex.test(value)
                        ? "Telefon numarası 7-14 rakam olmalıdır."
                        : "",
            }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const isPdf =
            file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
            setCvFile(null);
            setNotice({
                type: "error",
                title: "Geçersiz Dosya",
                message: "Sadece PDF formatında CV yükleyebilirsiniz.",
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setCvFile(null);
            setNotice({
                type: "error",
                title: "Dosya Boyutu Hatası",
                message: "CV dosyası en fazla 5 MB olabilir.",
            });
            return;
        }

        setCvFile(file);
    };

    const validate = () => {
        if (!form.firstName.trim()) {
            setNotice({
                type: "error",
                title: "Eksik Bilgi",
                message: "Lütfen ad alanını doldurun.",
            });
            return false;
        }

        if (!form.lastName.trim()) {
            setNotice({
                type: "error",
                title: "Eksik Bilgi",
                message: "Lütfen soyad alanını doldurun.",
            });
            return false;
        }

        if (!emailRegex.test(form.email)) {
            setNotice({
                type: "error",
                title: "E-posta Hatası",
                message: "Lütfen geçerli bir e-posta adresi girin.",
            });
            return false;
        }

        if (!phoneRegex.test(form.phone)) {
            setNotice({
                type: "error",
                title: "Telefon Hatası",
                message: "Lütfen geçerli bir telefon numarası girin.",
            });
            return false;
        }

        if (!cvFile) {
            setNotice({
                type: "error",
                title: "CV Eksik",
                message: "Lütfen PDF formatında CV dosyası yükleyin.",
            });
            return false;
        }

        return true;
    };

    const askConfirm = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (!validate()) return;

        setNotice({
            type: "confirm",
            title: "Başvuruyu Onayla",
            message: "Başvurunuzu İnsan Kaynakları ekibine iletmek istiyor musunuz?",
        });
    };

    const submitApplication = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("firstName", form.firstName.trim());
            formData.append("lastName", form.lastName.trim());
            formData.append("email", form.email.trim());
            formData.append("phone", `${selectedCountryCode}${form.phone.trim()}`);
            formData.append("jobPostingId", String(job.id));
            formData.append("cvFile", cvFile as File);

            await createApplication(formData);

            setNotice({
                type: "success",
                title: "Başvurunuz Alındı",
                message: "Başvurunuz İnsan Kaynakları ekibine iletildi.",
            });

            setTimeout(() => {
                onClose();
            }, 1200);
        } catch {
            setNotice({
                type: "error",
                title: "Başvuru Hatası",
                message: "Başvuru gönderilirken bir hata oluştu.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-sky-400/35 bg-[#07111f]/95 shadow-[0_0_70px_rgba(14,165,233,0.22)] backdrop-blur-2xl">
            {notice.type && (
                <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-[0_0_70px_rgba(15,23,42,0.95)]">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                        notice.type === "success"
                                            ? "bg-emerald-500/10 text-emerald-300"
                                            : notice.type === "confirm"
                                                ? "bg-blue-500/10 text-blue-300"
                                                : "bg-rose-500/10 text-rose-300"
                                    }`}
                                >
                                    {notice.type === "success" ? (
                                        <CheckCircle2 className="h-6 w-6" />
                                    ) : (
                                        <Info className="h-6 w-6" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        {notice.title}
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-slate-400">
                                        {notice.message}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setNotice({ type: null, title: "", message: "" })
                                }
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {notice.type === "confirm" ? (
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setNotice({ type: null, title: "", message: "" })
                                    }
                                    className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                                >
                                    Vazgeç
                                </button>

                                <button
                                    type="button"
                                    onClick={submitApplication}
                                    disabled={loading}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                                >
                                    {loading ? "Gönderiliyor..." : "Onayla"}
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    setNotice({ type: null, title: "", message: "" })
                                }
                                className="w-full rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 py-3 text-sm font-bold text-white"
                            >
                                Tamam
                            </button>
                        )}
                    </div>
                </div>
            )}

            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-7 py-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-300 transition hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-300"
                        title="İlan detayına geri dön"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300 shadow-[0_0_28px_rgba(124,58,237,0.28)]">
                        <FileText className="h-7 w-7" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-white">İş Başvurusu Yap</h2>
                        <p className="mt-1 text-xs text-slate-400">
                            {job.title} ilanı için başvuru formu
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            <form
                onSubmit={askConfirm}
                className="staffly-scroll min-h-0 flex-1 overflow-y-auto px-7 py-6"
            >
                <div className="mb-8 grid grid-cols-5 gap-2">
                    {steps.map((step, index) => (
                        <div key={step.number} className="relative text-center">
                            {index !== steps.length - 1 && (
                                <div
                                    className={`absolute left-[calc(50%+18px)] top-4 hidden h-px w-[calc(100%-36px)] md:block ${
                                        step.completed
                                            ? "bg-gradient-to-r from-sky-400 to-blue-500"
                                            : "bg-white/10"
                                    }`}
                                />
                            )}

                            <div
                                className={`relative z-10 mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition-all duration-300 ${
                                    step.completed
                                        ? "border-sky-400 bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.55)]"
                                        : step.active
                                            ? "border-sky-400/70 bg-sky-500/15 text-sky-200 shadow-[0_0_18px_rgba(14,165,233,0.35)]"
                                            : "border-white/15 bg-slate-900 text-slate-400"
                                }`}
                            >
                                {step.completed ? "✓" : step.number}
                            </div>

                            <p
                                className={`text-xs transition ${
                                    step.completed || step.active
                                        ? "font-semibold text-sky-200"
                                        : "text-slate-400"
                                }`}
                            >
                                {step.label}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sky-400/25 bg-sky-500/8 px-5 py-4 text-sm text-slate-300 shadow-[0_0_24px_rgba(14,165,233,0.08)]">
                    <Info className="h-5 w-5 shrink-0 text-sky-400" />
                    <span>{applicationHint}</span>
                </div>

                <h3 className="mb-4 text-lg font-bold text-white">Kişisel Bilgiler</h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormInput
                        label="Ad"
                        placeholder="Adınızı giriniz"
                        value={form.firstName}
                        onChange={(value) => setField("firstName", value)}
                        error={fieldErrors.firstName}
                    />

                    <FormInput
                        label="Soyad"
                        placeholder="Soyadınızı giriniz"
                        value={form.lastName}
                        onChange={(value) => setField("lastName", value)}
                        error={fieldErrors.lastName}
                    />

                    <FormInput
                        label="E-posta"
                        placeholder="ornek@email.com"
                        value={form.email}
                        onChange={(value) => setField("email", value)}
                        error={fieldErrors.email}
                    />

                    <FormInput
                        label="Telefon Numarası"
                        placeholder="5xx xxx xx xx"
                        value={form.phone}
                        onChange={(value) => setField("phone", value)}
                        error={fieldErrors.phone}
                        left={
                            <select
                                value={selectedCountryCode}
                                onChange={(e) => setSelectedCountryCode(e.target.value)}
                                className="mr-2 bg-transparent text-xs text-slate-300 outline-none"
                            >
                                {COUNTRY_CODES.map((country) => (
                                    <option
                                        key={country.code}
                                        value={country.code}
                                        className="bg-slate-950 text-white"
                                    >
                                        {country.label}
                                    </option>
                                ))}
                            </select>
                        }
                    />
                </div>

                <div className="mt-6 rounded-3xl border border-dashed border-slate-500/50 bg-slate-900/30 p-8 text-center shadow-inner shadow-black/20">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <UploadCloud className="mx-auto h-10 w-10 text-violet-300 drop-shadow-[0_0_10px_rgba(124,58,237,0.6)]" />

                    <p className="mt-3 text-lg font-bold text-white">CV Yükle</p>
                    <p className="mt-1 text-sm text-slate-400">PDF (Max. 5MB)</p>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-5 rounded-2xl bg-slate-900/80 px-8 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                        Dosya Seç
                    </button>

                    {cvFile && (
                        <p className="mt-4 text-sm font-semibold text-sky-300">
                            {cvFile.name}
                        </p>
                    )}
                </div>
            </form>

            <div className="shrink-0 border-t border-white/10 px-7 py-6">
                <button
                    type="button"
                    onClick={askConfirm}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 py-4 text-base font-bold text-white shadow-[0_20px_45px_rgba(37,99,235,0.38)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-60"
                >
                    {loading ? "Gönderiliyor..." : "Devam Et"}
                    <ArrowRight className="h-5 w-5" />
                </button>

                <p className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                    <ShieldCheck className="h-4 w-4 text-sky-400" />
                    Başvurunuz İnsan Kaynakları ekibine güvenli şekilde iletilecektir.
                </p>
            </div>
        </section>
    );
};

const FormInput = ({
                       label,
                       placeholder,
                       value,
                       onChange,
                       error,
                       icon,
                       left,
                   }: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    icon?: React.ReactNode;
    left?: React.ReactNode;
}) => {
    return (
        <div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/55 px-4 py-3.5 shadow-inner shadow-black/20 transition focus-within:border-sky-400/60 focus-within:bg-slate-900/75">
                <label className="text-xs text-slate-400">{label}</label>

                <div className="mt-1 flex items-center">
                    {left}
                    <input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-500"
                    />
                    {icon}
                </div>
            </div>

            {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
        </div>
    );
};

export default JobApplicationModal;