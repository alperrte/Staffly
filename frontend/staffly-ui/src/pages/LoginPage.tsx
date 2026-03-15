import { useNavigate } from "react-router-dom"
import { useState } from "react"
import loginBg from "../assets/login-bg.jpg"
import stafflyLogo from "../assets/logo.png"
import { Mail, Lock, Eye, EyeOff, Upload, ChevronDown, ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [selectedPosition, setSelectedPosition] = useState("")
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault()

        try {

            const res = await fetch("http://localhost:8081/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })

            const data = await res.json()

            localStorage.setItem("token", data.accessToken)
            navigate("/test")

        } catch {

            alert("Login başarısız")

        }

    }
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            {/* Background Image + Overlay + Glow */}
            <div className="absolute inset-0">
                <img
                    src={loginBg}
                    alt="Background"
                    className="h-full w-full object-cover"
                />
                {/* dark vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.45),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.45),transparent_55%)] mix-blend-screen opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-slate-950/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
                {/* Logo */}
                <div className="mb-10 flex items-center gap-4">
                    {/* Logo bloğu */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl
            bg-gradient-to-br from-blue-500 to-blue-700 p-[3px]
            shadow-[0_0_25px_rgba(59,130,246,0.7)]">
                        <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-950">
                            <img
                                src={stafflyLogo}
                                alt="Staffly Logo"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </div>
                    {/* Yazı kısmı */}
                    <div className="flex flex-col gap-1">
                        <h1 className="text-[2.1rem] font-semibold tracking-[0.35em] text-white/95 leading-none">
                            STAFFLY
                        </h1>
                        <p className="text-[0.7rem] font-light tracking-[0.45em] text-sky-300/90 uppercase">
                            HR MANAGEMENT SYSTEM
                        </p>
                    </div>
                </div>

                {/* Cards Container */}
                <div className="flex w-full max-w-5xl flex-col gap-6 lg:flex-row">
                    {/* Login Card */}
                    <div className="flex-1 rounded-3xl border border-white/12 bg-white/6 p-8 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-2xl lg:p-9">
                        <h2 className="mb-7 text-[1.6rem] font-semibold tracking-wide text-white">
                            Sisteme Giriş Yap
                        </h2>

                        <form className="space-y-5" onSubmit={handleLogin}>
                            {/* Email */}
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

                            {/* Password */}
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

                            {/* Remember & Forgot */}
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

                            {/* Submit */}
                            <button
                                type="submit"
                                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-[0_15px_40px_rgba(56,189,248,0.55)] transition hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 focus:outline-none"
                            >
                                Giriş Yap
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    {/* Application Card */}
                    <div className="flex-1 rounded-3xl border border-white/12 bg-white/6 p-8 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-2xl lg:p-9">
                        <h2 className="mb-1 text-[1.6rem] font-semibold tracking-wide text-white">
                            İş Başvurusu Yap
                        </h2>
                        <p className="mb-7 text-sm text-slate-300">

                        </p>

                        <form className="space-y-5">
                            {/* CV Upload */}
                            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-white/20 bg-slate-900/40 p-6">
                                <Upload className="mb-3 h-9 w-9 text-slate-300" />
                                <p className="text-sm font-semibold text-white">CV Yükle</p>
                                <p className="mb-4 text-[0.7rem] text-slate-300">
                                    PDF, DOC, DOCX (Max. 5MB)
                                </p>
                                <button
                                    type="button"
                                    className="rounded-xl bg-slate-900/80 px-5 py-2 text-xs font-medium text-white shadow-[0_0_20px_rgba(15,23,42,0.8)] hover:bg-slate-800"
                                >
                                    Dosya Seç
                                </button>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-slate-300">
                                    Ad Soyad
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ad Soyad"
                                    className="w-full rounded-xl border border-white/15 bg-slate-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                />
                            </div>

                            {/* Email */}
                            <input
                                type="email"
                                placeholder="E-posta"
                                className="w-full rounded-xl border border-white/15 bg-slate-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                            />

                            {/* Phone */}
                            <input
                                type="tel"
                                placeholder="Telefon"
                                className="w-full rounded-xl border border-white/15 bg-slate-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                            />

                            {/* Position */}
                            <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  Pozisyon
                </span>
                                <select
                                    value={selectedPosition}
                                    onChange={(e) => setSelectedPosition(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-white/15 bg-slate-900/40 py-3 pl-24 pr-10 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/70"
                                >
                                    <option value="" className="bg-slate-900">

                                    </option>
                                    <option value="developer" className="bg-slate-900">
                                        test
                                    </option>
                                    <option value="designer" className="bg-slate-900">
                                        test
                                    </option>
                                    <option value="manager" className="bg-slate-900">
                                        test
                                    </option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-white/95 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_15px_45px_rgba(15,23,42,0.9)] transition hover:bg-white"
                            >
                                Başvuru Yap
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
    )
}