import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
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

            const response = await api.post("/auth/set-password", {
                token,
                password,
            });

            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);

            setSuccess(true);
            setMessage("Şifreniz başarıyla oluşturuldu. Ana sayfaya yönlendiriliyorsunuz.");

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
                <img src={loginBg} alt="Background" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.45),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.45),transparent_55%)] mix-blend-screen opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/75 to-slate-950/90" />
            </div>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
                <div className="mb-10 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-[3px] shadow-[0_0_25px_rgba(59,130,246,0.7)]">
                        <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-950">
                            <img src={stafflyLogo} alt="Staffly Logo" className="h-full w-full object-cover" />
                        </div>
                    </div>

                    <div>
                        <h1 className="leading-none text-[2.1rem] font-semibold tracking-[0.35em] text-white/95">
                            STAFFLY
                        </h1>
                        <p className="text-[0.7rem] font-light uppercase tracking-[0.45em] text-sky-300/90">
                            HR MANAGEMENT SYSTEM
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-md rounded-3xl border border-white/12 bg-white/6 p-8 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
                    <h2 className="text-[1.6rem] font-semibold tracking-wide text-white">
                        Şifre Oluştur
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Staffly hesabınızı aktif hale getirmek için yeni şifrenizi belirleyin.
                    </p>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Yeni Şifre"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-slate-900/40 py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <div className="relative">
                            <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Yeni Şifre Tekrar"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-xl border border-white/15 bg-slate-900/40 py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                            />
                        </div>

                        {message && (
                            <div
                                className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                                    success
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                        : "border-rose-500/30 bg-rose-500/10 text-rose-200"
                                }`}
                            >
                                {success ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
                                <span>{message}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(56,189,248,0.55)] transition hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Kaydediliyor..." : "Şifremi Oluştur"}
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}