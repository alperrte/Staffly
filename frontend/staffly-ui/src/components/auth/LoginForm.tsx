import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Mail,
    ShieldCheck,
    X,
} from "lucide-react";
import { login } from "../../services/authService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const LoginForm = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const openError = (message: string) => {
        setErrorMessage(message);
        setErrorModalOpen(true);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailRegex.test(email)) {
            openError("Lütfen geçerli bir e-posta adresi girin.");
            return;
        }

        if (!password.trim()) {
            openError("Lütfen şifre alanını doldurun.");
            return;
        }

        try {
            const data = await login(email, password);
            localStorage.setItem("token", data.accessToken);

            if (data.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken);
            }

            navigate("/app");
        } catch {
            openError("Giriş başarısız. E-posta veya şifre hatalı olabilir.");
        }
    };

    return (
        <>
            {errorModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-rose-400/20 bg-slate-950 p-6 shadow-[0_0_70px_rgba(15,23,42,0.95)]">
                        <div className="mb-5 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                                    <X className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">
                                        Giriş Hatası
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {errorMessage}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setErrorModalOpen(false)}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setErrorModalOpen(false)}
                            className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-violet-600 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Tamam
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full rounded-[2rem] border border-white/15 bg-slate-950/45 p-8 shadow-[0_0_70px_rgba(15,23,42,0.88)] backdrop-blur-2xl lg:p-10">
                <h2 className="text-[1.65rem] font-bold text-white">
                    Sisteme Giriş Yap
                </h2>
                <form className="mt-7 space-y-5" onSubmit={handleLogin}>
                    <div className="rounded-2xl border border-white/12 bg-slate-900/45 px-4 py-3.5 transition focus-within:border-sky-400/60">
                        <div className="flex items-center gap-4">
                            <Mail className="h-5 w-5 text-slate-400" />

                            <div className="min-w-0 flex-1">
                                <label className="text-xs text-slate-500">
                                    E-posta
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e-posta"
                                    className="mt-1 w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/12 bg-slate-900/45 px-4 py-3.5 transition focus-within:border-sky-400/60">
                        <div className="flex items-center gap-4">
                            <Lock className="h-5 w-5 text-slate-400" />

                            <div className="min-w-0 flex-1">
                                <label className="text-xs text-slate-500">
                                    Şifre
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="mt-1 w-full bg-transparent text-sm font-medium text-white outline-none placeholder:text-slate-400"
                                />
                            </div>

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
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={() => navigate("/reset-password")}
                            className="font-medium text-sky-300 transition hover:text-sky-200"
                        >
                            Şifremi Unuttum?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-violet-600 py-4 text-base font-bold text-white shadow-[0_20px_45px_rgba(37,99,235,0.42)] transition hover:scale-[1.01] hover:opacity-95"
                    >
                        Giriş Yap
                        <ArrowRight className="h-5 w-5" />
                    </button>

                    <div className="pt-8">
                        <div className="mb-5 flex items-center gap-4">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                            <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
            Güvenli Oturum
        </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-slate-900/35 px-4 py-4 text-center shadow-inner shadow-black/20">
                                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-300">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-semibold text-white">
                                    SSL Korumalı
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    256-bit güvenlik
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-slate-900/35 px-4 py-4 text-center shadow-inner shadow-black/20">
                                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-semibold text-white">
                                    Yetkili Erişim
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Rol bazlı kontrol
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-slate-900/35 px-4 py-4 text-center shadow-inner shadow-black/20">
                                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                                    <Eye className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-semibold text-white">
                                    İzlenebilirlik
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Güvenli oturum kaydı
                                </p>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
};

export default LoginForm;