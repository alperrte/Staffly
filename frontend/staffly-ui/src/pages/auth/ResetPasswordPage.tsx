import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import api from "../../services/api";
import loginBg from "../../assets/login-bg.jpg";
import stafflyLogo from "../../assets/logo.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");
    const token = searchParams.get("token");
    const hasToken = Boolean(token);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!emailRegex.test(email)) {
            setSuccess(false);
            setMessage("Lütfen geçerli bir e-posta adresi girin.");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/forgot-password", {
                email,
            });

            setSuccess(true);
            setMessage("Şifre sıfırlama linki e-posta adresinize gönderildi.");
        } catch {
            setSuccess(false);
            setMessage("Bu e-posta adresine ait kullanıcı bulunamadı veya işlem sırasında hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const showTemporaryErrorModal = (text: string) => {
        setErrorModalMessage(text);
        setErrorModalOpen(true);

        setTimeout(() => {
            setErrorModalOpen(false);
            setErrorModalMessage("");
        }, 2000);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
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

            let response;

            try {
                response = await api.post("/auth/set-password", {
                    token,
                    password,
                });
            } catch (error: any) {
                const backendMessage = error.response?.data;

                if (backendMessage === "SAME_PASSWORD") {
                    setPassword("");
                    setConfirmPassword("");

                    showTemporaryErrorModal("Eski şifre ile yeni şifre aynı olamaz.");
                    return; // ❗ BURASI ÇOK KRİTİK
                }

                setMessage("Şifre sıfırlanırken hata oluştu.");
                return;
            }

            localStorage.setItem("token", response.data.accessToken);
            localStorage.setItem("refreshToken", response.data.refreshToken);

            setSuccess(true);
            setMessage("Şifreniz başarıyla sıfırlandı. Ana sayfaya yönlendiriliyorsunuz.");

            setTimeout(() => {
                navigate("/app");
            }, 1500);
        } catch (error: any) {
            setSuccess(false);

            const backendMessage = error.response?.data;

            if (
                typeof backendMessage === "string" &&
                backendMessage.includes("same as old password")
            ) {
                setMessage("Yeni şifre, eski şifreyle aynı olamaz.");
            } else {
                setMessage("Şifre sıfırlanırken bir hata oluştu. Link süresi dolmuş veya daha önce kullanılmış olabilir.");
            }
        }finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            {errorModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-950/95 p-6 shadow-[0_0_50px_rgba(15,23,42,0.95)]">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-10 w-10 text-rose-400" />
                            <div>
                                <h3 className="text-lg font-semibold text-white">Şifre Hatası</h3>
                                <p className="mt-2 text-sm text-slate-300">
                                    {errorModalMessage}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                        {hasToken ? "Yeni Şifre Belirle" : "Şifremi Unuttum"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        {hasToken
                            ? "Hesabınız için yeni şifrenizi belirleyin."
                            : "E-posta adresinizi girin. Şifre sıfırlama linki mail adresinize gönderilecektir."}
                    </p>

                    {!hasToken ? (
                        <form className="mt-8 space-y-5" onSubmit={handleForgotPassword}>
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

                            {message && (
                                <MessageBox success={success} message={message} />
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(56,189,248,0.55)] transition hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Gönderiliyor..." : "Şifre Sıfırlama Linki Gönder"}
                                <ArrowRight className="h-5 w-5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="w-full text-sm font-medium text-sky-300 hover:text-sky-200"
                            >
                                Giriş sayfasına dön
                            </button>
                        </form>
                    ) : (
                        <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
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
                                <MessageBox success={success} message={message} />
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(56,189,248,0.55)] transition hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? "Kaydediliyor..." : "Şifremi Sıfırla"}
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function MessageBox({ success, message }: { success: boolean; message: string }) {
    return (
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
    );
}