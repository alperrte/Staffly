import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import loginBg from "../../assets/login-bg.jpg";
import stafflyLogo from "../../assets/logo.png";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Upload,
    ChevronDown,
    ArrowRight,
    ShieldCheck,
    X,
    CheckCircle2,
    AlertTriangle,
    Info,
} from "lucide-react";
import { login } from "../../services/authService";
import { createApplication } from "../../services/applicationService";

type ModalType = "success" | "error" | "info" | "confirm";

type ModalState = {
    open: boolean;
    type: ModalType;
    title: string;
    message: string;
};

const COUNTRY_CODES = [
    { code: "+90", label: "TR (+90)" },
    { code: "+1", label: "US (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+49", label: "DE (+49)" },
    { code: "+33", label: "FR (+33)" },
    { code: "+39", label: "IT (+39)" },
    { code: "+31", label: "NL (+31)" },
    { code: "+34", label: "ES (+34)" },
];

const emailRegex =
    /^[^\s@]+@(gmail\.com|hotmail\.com|outlook\.com|yahoo\.com|icloud\.com)$/i;

const nameRegex = /^[A-Za-zÀ-ž\s]+$/;
const phoneRegex = /^[0-9]{7,14}$/;

function FeedbackModal({
                           modal,
                           onClose,
                           onConfirm,
                       }: {
    modal: ModalState;
    onClose: () => void;
    onConfirm?: () => void;
}) {
    if (!modal.open) return null;

    const iconMap = {
        success: <CheckCircle2 className="h-10 w-10 text-emerald-400" />,
        error: <AlertTriangle className="h-10 w-10 text-rose-400" />,
        info: <Info className="h-10 w-10 text-sky-400" />,
        confirm: <Info className="h-10 w-10 text-amber-400" />,
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/95 p-6 shadow-[0_0_50px_rgba(15,23,42,0.95)] animate-in zoom-in-95 duration-300">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {iconMap[modal.type]}
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                {modal.title}
                            </h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mb-6 text-sm leading-6 text-slate-300">
                    {modal.message}
                </p>

                {modal.type === "confirm" ? (
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                            Vazgeç
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Onayla
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Tamam
                    </button>
                )}
            </div>
        </div>
    );
}

export default function LoginPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [selectedPosition, setSelectedPosition] = useState("");
    const [selectedCountryCode, setSelectedCountryCode] = useState("+90");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [applicationForm, setApplicationForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        department: "",
        position: "",
    });

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [applicationLoading, setApplicationLoading] = useState(false);

    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    const [modal, setModal] = useState<ModalState>({
        open: false,
        type: "info",
        title: "",
        message: "",
    });

    useEffect(() => {
        return () => {
            if (autoCloseTimerRef.current) {
                clearTimeout(autoCloseTimerRef.current);
            }
        };
    }, []);

    const openModal = (
        type: ModalType,
        title: string,
        message: string,
        autoClose = false
    ) => {
        setModal({
            open: true,
            type,
            title,
            message,
        });

        if (autoClose) {
            if (autoCloseTimerRef.current) {
                clearTimeout(autoCloseTimerRef.current);
            }

            autoCloseTimerRef.current = setTimeout(() => {
                setModal((prev) => ({ ...prev, open: false }));
            }, 5000);
        }
    };

    const closeModal = () => {
        if (autoCloseTimerRef.current) {
            clearTimeout(autoCloseTimerRef.current);
        }
        setModal((prev) => ({ ...prev, open: false }));
    };

    const validateNameField = (value: string) => {
        if (!value.trim()) return "";
        return nameRegex.test(value)
            ? ""
            : "Ad soyad alanında sayı veya özel karakter olamaz.";
    };

    const validateEmailField = (value: string) => {
        if (!value.trim()) return "";
        return emailRegex.test(value)
            ? ""
            : "E-posta geçersiz. Örnek: example@gmail.com";
    };

    const validatePhoneField = (value: string) => {
        if (!value.trim()) return "";
        return phoneRegex.test(value)
            ? ""
            : "Telefon numarası sadece rakamlardan oluşmalı ve geçerli uzunlukta olmalıdır.";
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailRegex.test(email)) {
            openModal(
                "error",
                "Geçersiz E-posta",
                "Lütfen giriş için geçerli bir e-posta adresi girin. Örnek: example@gmail.com"
            );
            return;
        }

        if (!password.trim()) {
            openModal(
                "error",
                "Eksik Şifre",
                "Lütfen şifre alanını doldurun."
            );
            return;
        }

        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.accessToken);
            navigate("/app");
        } catch (error) {
            openModal(
                "error",
                "Giriş Başarısız",
                "Yanlış e-posta veya yanlış şifre girdiniz. Lütfen bilgilerinizi kontrol edip tekrar deneyin."
            );
        }
    };

    const handleApplicationChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setApplicationForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "firstName") {
            setFieldErrors((prev) => ({
                ...prev,
                firstName: validateNameField(value),
            }));
        }

        if (name === "lastName") {
            setFieldErrors((prev) => ({
                ...prev,
                lastName: validateNameField(value),
            }));
        }

        if (name === "email") {
            setFieldErrors((prev) => ({
                ...prev,
                email: validateEmailField(value),
            }));
        }

        if (name === "phone") {
            const numericValue = value.replace(/\D/g, "");
            setApplicationForm((prev) => ({
                ...prev,
                phone: numericValue,
            }));
            setFieldErrors((prev) => ({
                ...prev,
                phone: validatePhoneField(numericValue),
            }));
        }
    };

    const handleSelectFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        if (!file) return;

        const isPdf =
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf");
        const isValidSize = file.size <= 5 * 1024 * 1024;

        if (!isPdf) {
            setCvFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            openModal(
                "error",
                "Geçersiz Dosya",
                "Sadece PDF formatında dosya yükleyebilirsiniz."
            );
            return;
        }

        if (!isValidSize) {
            setCvFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            openModal(
                "error",
                "Dosya Boyutu Hatası",
                "Yüklemek istediğiniz dosya en fazla 5 MB olabilir."
            );
            return;
        }

        setCvFile(file);
        openModal(
            "success",
            "Dosya Yüklendi",
            "Dosyanız başarıyla yüklendi.",
            true
        );
    };

    const validateApplicationForm = () => {
        const newErrors = {
            firstName: validateNameField(applicationForm.firstName),
            lastName: validateNameField(applicationForm.lastName),
            email: validateEmailField(applicationForm.email),
            phone: validatePhoneField(applicationForm.phone),
        };

        setFieldErrors(newErrors);

        if (!applicationForm.firstName.trim()) {
            openModal("error", "Eksik Bilgi", "Lütfen ad alanını doldurun.");
            return false;
        }

        if (!applicationForm.lastName.trim()) {
            openModal("error", "Eksik Bilgi", "Lütfen soyad alanını doldurun.");
            return false;
        }

        if (!applicationForm.email.trim()) {
            openModal("error", "Eksik Bilgi", "Lütfen e-posta alanını doldurun.");
            return false;
        }

        if (!applicationForm.phone.trim()) {
            openModal("error", "Eksik Bilgi", "Lütfen telefon alanını doldurun.");
            return false;
        }

        if (!applicationForm.department.trim()) {
            openModal(
                "error",
                "Eksik Bilgi",
                "Lütfen departman alanını doldurun."
            );
            return false;
        }

        if (!applicationForm.position.trim()) {
            openModal("error", "Eksik Bilgi", "Lütfen bir pozisyon seçin.");
            return false;
        }

        if (!cvFile) {
            openModal(
                "error",
                "CV Eksik",
                "Lütfen PDF formatında bir CV dosyası seçin."
            );
            return false;
        }

        if (
            newErrors.firstName ||
            newErrors.lastName ||
            newErrors.email ||
            newErrors.phone
        ) {
            openModal(
                "error",
                "Form Hatası",
                "Lütfen kırmızı hata mesajı görünen alanları düzeltin."
            );
            return false;
        }

        return true;
    };

    const submitApplication = async () => {
        try {
            setApplicationLoading(true);
            closeModal();

            const formData = new FormData();
            formData.append("firstName", applicationForm.firstName.trim());
            formData.append("lastName", applicationForm.lastName.trim());
            formData.append("email", applicationForm.email.trim());
            formData.append(
                "phone",
                `${selectedCountryCode}${applicationForm.phone.trim()}`
            );
            formData.append("department", applicationForm.department.trim());
            formData.append("position", applicationForm.position);
            formData.append("cvFile", cvFile as File);

            await createApplication(formData);

            setApplicationForm({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                department: "",
                position: "",
            });
            setSelectedPosition("");
            setSelectedCountryCode("+90");
            setCvFile(null);
            setFieldErrors({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            openModal(
                "success",
                "Başvurunuz Alınmıştır",
                "Başvurunuz alınmıştır. Mail yoluyla sizinle iletişime geçilecektir.",
                true
            );
        } catch (error) {
            console.error("Başvuru gönderme hatası:", error);
            openModal(
                "error",
                "Başvuru Hatası",
                "Başvuru gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
            );
        } finally {
            setApplicationLoading(false);
        }
    };

    const handleApplicationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateApplicationForm();

        if (!isValid) return;

        setModal({
            open: true,
            type: "confirm",
            title: "Başvuruyu Onayla",
            message:
                "İş başvurunuzu göndermek istediğinize emin misiniz? Onayladıktan sonra bilgileriniz İnsan Kaynakları ekibine iletilecektir.",
        });
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            <div className="absolute inset-0">
                <img
                    src={loginBg}
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.45),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.45),transparent_55%)] mix-blend-screen opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-slate-950/80" />
            </div>

            <FeedbackModal
                modal={modal}
                onClose={closeModal}
                onConfirm={submitApplication}
            />

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
                <div className="mb-10 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-[3px] shadow-[0_0_25px_rgba(59,130,246,0.7)]">
                        <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-950">
                            <img
                                src={stafflyLogo}
                                alt="Staffly Logo"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <h1 className="leading-none text-[2.1rem] font-semibold tracking-[0.35em] text-white/95">
                            STAFFLY
                        </h1>
                        <p className="text-[0.7rem] font-light uppercase tracking-[0.45em] text-sky-300/90">
                            HR MANAGEMENT SYSTEM
                        </p>
                    </div>
                </div>

                <div className="flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
                    <div className="flex-1 rounded-3xl border border-white/12 bg-white/6 p-8 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-2xl lg:p-9">
                        <h2 className="mb-7 text-[1.6rem] font-semibold tracking-wide text-white">
                            Sisteme Giriş Yap
                        </h2>

                        <form className="space-y-5" onSubmit={handleLogin}>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="E-posta Adresi"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-white/15 bg-slate-900/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                />
                            </div>

                            <div className="relative">
                                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Şifre"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-white/15 bg-slate-900/40 py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-500/60 bg-slate-900/60 text-sky-500 accent-sky-500"
                                    />
                                    <span className="text-slate-300">Beni Hatırla</span>
                                </label>
                                <button
                                    type="button"
                                    className="text-sm font-medium text-sky-300 hover:text-sky-200"
                                >
                                    Şifremi Unuttum?
                                </button>
                            </div>

                            <button
                                type="submit"
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(56,189,248,0.55)] transition hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 focus:outline-none"
                            >
                                Giriş Yap
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    <div className="flex-1 rounded-3xl border border-white/12 bg-white/6 p-8 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-2xl lg:p-9">
                        <h2 className="mb-1 text-[1.6rem] font-semibold tracking-wide text-white">
                            İş Başvurusu Yap
                        </h2>
                        <p className="mb-7 text-sm leading-6 text-slate-300">
                            Lütfen bilgilerinizi eksiksiz doldurun, CV dosyanızı PDF
                            formatında yükleyin ve başvurunuzu güvenle iletin.
                        </p>

                        <form className="space-y-5" onSubmit={handleApplicationSubmit}>
                            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/40 p-6">
                                <Upload className="mb-3 h-9 w-9 text-slate-300" />
                                <p className="text-sm font-semibold text-white">CV Yükle</p>
                                <p className="mb-4 text-[0.7rem] text-slate-300">
                                    PDF (Max. 5MB)
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={handleSelectFileClick}
                                    className="rounded-xl bg-slate-900/80 px-5 py-2 text-xs font-medium text-white shadow-[0_0_20px_rgba(15,23,42,0.8)] hover:bg-slate-800"
                                >
                                    Dosya Seç
                                </button>

                                {cvFile && (
                                    <p className="mt-3 text-center text-xs text-sky-300">
                                        {cvFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="Ad"
                                        value={applicationForm.firstName}
                                        onChange={handleApplicationChange}
                                        className="w-full rounded-xl border border-white/15 bg-slate-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                        required
                                    />
                                    {fieldErrors.firstName && (
                                        <p className="mt-1 text-xs text-red-400">
                                            {fieldErrors.firstName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Soyad"
                                        value={applicationForm.lastName}
                                        onChange={handleApplicationChange}
                                        className="w-full rounded-xl border border-white/15 bg-slate-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                        required
                                    />
                                    {fieldErrors.lastName && (
                                        <p className="mt-1 text-xs text-red-400">
                                            {fieldErrors.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-posta"
                                    value={applicationForm.email}
                                    onChange={handleApplicationChange}
                                    className="w-full rounded-xl border border-white/15 bg-slate-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                    required
                                />
                                {fieldErrors.email && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <div className="relative w-36">
                                    <select
                                        value={selectedCountryCode}
                                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                                        className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900/40 py-3 pl-4 pr-10 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                    >
                                        {COUNTRY_CODES.map((country) => (
                                            <option
                                                key={country.code}
                                                value={country.code}
                                                className="bg-slate-900"
                                            >
                                                {country.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                </div>

                                <div className="flex-1">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Telefon Numarası"
                                        value={applicationForm.phone}
                                        onChange={handleApplicationChange}
                                        className="w-full rounded-xl border border-white/15 bg-slate-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                        required
                                    />
                                    {fieldErrors.phone && (
                                        <p className="mt-1 text-xs text-red-400">
                                            {fieldErrors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <input
                                type="text"
                                name="department"
                                placeholder="Departman"
                                value={applicationForm.department}
                                onChange={handleApplicationChange}
                                className="w-full rounded-xl border border-white/15 bg-slate-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                required
                            />

                            <div className="relative">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                                    Pozisyon
                                </span>
                                <select
                                    name="position"
                                    value={selectedPosition}
                                    onChange={(e) => {
                                        setSelectedPosition(e.target.value);
                                        setApplicationForm((prev) => ({
                                            ...prev,
                                            position: e.target.value,
                                        }));
                                    }}
                                    className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900/40 py-3 pl-24 pr-10 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                    required
                                >
                                    <option value="" className="bg-slate-900">
                                        Seçiniz
                                    </option>
                                    <option value="Backend Developer" className="bg-slate-900">
                                        Backend Developer
                                    </option>
                                    <option value="Frontend Developer" className="bg-slate-900">
                                        Frontend Developer
                                    </option>
                                    <option value="UI/UX Designer" className="bg-slate-900">
                                        UI/UX Designer
                                    </option>
                                    <option value="HR Specialist" className="bg-slate-900">
                                        HR Specialist
                                    </option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            </div>

                            <button
                                type="submit"
                                disabled={applicationLoading}
                                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-white/95 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_15px_45px_rgba(15,23,42,0.9)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {applicationLoading ? "Gönderiliyor..." : "Başvuru Yap"}
                                <ArrowRight className="h-5 w-5" />
                            </button>

                            <p className="flex items-center justify-center gap-2 text-[0.7rem] text-slate-300/90">
                                <ShieldCheck className="h-4 w-4 text-sky-400" />
                                Başvurunuz İnsan Kaynakları ekibine iletilecektir.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}