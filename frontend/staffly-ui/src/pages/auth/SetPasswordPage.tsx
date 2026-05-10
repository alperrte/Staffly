import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    CheckCircle2,
    AlertTriangle,
    KeyRound,
    ShieldCheck,
    ArrowLeft,
} from "lucide-react";
import api from "../../services/api";
import loginBg from "../../assets/login-bg.jpg";
import stafflyLogo from "../../assets/logo.png";

export default function SetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const passwordsMatch =
        password.trim() &&
        confirmPassword.trim() &&
        password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            setSuccess(false);
            setMessage("Geçersiz veya eksik token.");
            return;
        }

        if (!password.trim() || !confirmPassword.trim()) {
            setSuccess(false);
            setMessage("Lütfen tüm alanları doldurun.");
            return;
        }

        if (password !== confirmPassword) {
            setSuccess(false);
            setMessage("Şifreler eşleşmiyor.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const response = await api.post("/auth/set-password", {
                token,
                password,
            });

            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);

            setSuccess(true);
            setMessage("Şifreniz başarıyla oluşturuldu. Sisteme giriş yapılıyor.");

            setTimeout(() => {
                navigate("/app");
            }, 1500);
        } catch {
            setSuccess(false);
            setMessage("Şifre oluşturulurken bir hata oluştu. Link süresi dolmuş veya daha önce kullanılmış olabilir.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            <div className="absolute inset-0">
                <img
                    src={loginBg}
                    alt="Staffly Set Password Background"
                    className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(14,165,233,0.34),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(37,99,235,0.22),transparent_40%)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-slate-950/80 to-black/75" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(14,165,233,0.06)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
                <div className="mb-10 flex items-center justify-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-violet-600 p-[3px] shadow-[0_0_35px_rgba(59,130,246,0.75)]">
                        <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-950">
                            <img
                                src={stafflyLogo}
                                alt="Staffly Logo"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>

                    <div>
                        <h1 className="leading-none text-[2.15rem] font-semibold tracking-[0.38em] text-white">
                            STAFFLY
                        </h1>
                        <p className="mt-1 text-[0.72rem] font-medium uppercase tracking-[0.44em] text-sky-300">
                            HR Management System
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-[31rem] rounded-[2rem] border border-white/15 bg-slate-950/48 p-8 shadow-[0_0_75px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
                    <div className="mb-7 flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 shadow-[0_0_30px_rgba(37,99,235,0.32)]">
                            <KeyRound className="h-7 w-7" />
                        </div>

                        <div>
                            <h2 className="text-[1.65rem] font-bold tracking-tight text-white">
                                Şifre Oluştur
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Staffly hesabınızı aktif hale getirmek için yeni şifrenizi belirleyin.
                            </p>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <InputBox
                            icon={<Lock className="h-5 w-5" />}
                            label="Yeni Şifre"
                            placeholder="Yeni şifrenizi girin"
                            value={password}
                            onChange={setPassword}
                            type={showPassword ? "text" : "password"}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="text-slate-400 transition hover:text-white"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            }
                        />

                        <InputBox
                            icon={<Lock className="h-5 w-5" />}
                            label="Yeni Şifre Tekrar"
                            placeholder="Yeni şifrenizi tekrar girin"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            type={showPassword ? "text" : "password"}
                            rightIcon={
                                passwordsMatch ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                ) : null
                            }
                        />

                        {message && (
                            <MessageBox success={success} message={message} />
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 py-4 text-sm font-bold text-white shadow-[0_20px_45px_rgba(37,99,235,0.42)] transition hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Kaydediliyor..." : "Şifremi Oluştur"}
                            <ArrowRight className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/35 py-3.5 text-sm font-semibold text-sky-300 transition hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-sky-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Giriş sayfasına dön
                        </button>
                    </form>

                    <div className="mt-7 border-t border-white/10 pt-5">
                        <div className="mb-5 flex items-center gap-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                            <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
                                Güvenli Aktivasyon
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <SecurityMiniCard
                                icon={<ShieldCheck className="h-5 w-5" />}
                                title="SSL Korumalı"
                            />

                            <SecurityMiniCard
                                icon={<KeyRound className="h-5 w-5" />}
                                title="Tek Kullanımlık Link"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputBox({
                      icon,
                      label,
                      placeholder,
                      value,
                      onChange,
                      type,
                      rightIcon,
                  }: {
    icon: React.ReactNode;
    label: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    type: string;
    rightIcon?: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-white/12 bg-slate-900/45 px-4 py-3.5 shadow-inner shadow-black/20 transition focus-within:border-sky-400/60 focus-within:bg-slate-900/65">
            <div className="flex items-center gap-4">
                <span className="text-slate-400">{icon}</span>

                <div className="min-w-0 flex-1">
                    <label className="text-xs text-slate-500">{label}</label>
                    <input
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
                    />
                </div>

                {rightIcon}
            </div>
        </div>
    );
}

function MessageBox({ success, message }: { success: boolean; message: string }) {
    return (
        <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
                success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-200"
            }`}
        >
            {success ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <span className="leading-6">{message}</span>
        </div>
    );
}

function SecurityMiniCard({
                              icon,
                              title,
                              description,
                          }: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-slate-900/35 px-4 py-4 shadow-inner shadow-black/20">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                {icon}
            </div>
            <p className="text-xs font-semibold text-white">{title}</p>
            <p className="mt-1 text-[11px] text-slate-500">{description}</p>
        </div>
    );
}