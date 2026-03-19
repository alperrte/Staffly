import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./MainSideBar";
import stafflyLogo from "../assets/logo.png";
import { Bell, ChevronDown, Search } from "lucide-react";
import { Power } from "lucide-react";
import { useEffect, useState } from "react";

const MainLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.clear();
        navigate("/", { replace: true });
    };
    const [email, setEmail] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setEmail(payload.sub || payload.email);
        } catch (e) {
            setEmail("");
        }
    }, []);
//Push

    return (
        <div className="flex h-screen bg-[#020617] text-white overflow-hidden">
            {/* SOL SİDEBAR */}
            <Sidebar />

            {/* ARKA PLAN */}
            <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-0 opacity-60">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(56,189,248,0.4),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.45),transparent_55%)]" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950" />
                </div>

                {/* İÇERİK ALANI */}
                <div className="relative z-10 flex flex-col h-full px-8 py-6">
                    {/* HEADER */}
                    <header className="mb-6 flex items-center justify-between">
                        {/* Sol: Logo + Başlık */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-[2px] shadow-[0_0_18px_rgba(59,130,246,0.7)]">
                                <div className="h-full w-full overflow-hidden rounded-2xl bg-slate-950">
                                    <img
                                        src={stafflyLogo}
                                        alt="Staffly Logo"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-[0.35em] text-white/95">
                                    STAFFLY
                                </h1>
                                <p className="text-[0.6rem] font-light tracking-[0.35em] text-sky-300/90 uppercase">
                                    HR MANAGEMENT SYSTEM
                                </p>
                            </div>
                        </div>

                        {/* Ortadaki Search */}
                        <div className="mx-8 flex-1 max-w-xl hidden md:flex">
                            <div className="relative w-full">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder=" "
                                    className="w-full rounded-full border border-white/10 bg-slate-900/50 py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-500/60"
                                />
                            </div>
                        </div>

                        {/* Sağ: Bildirim + Kullanıcı */}
                        <div className="flex items-center gap-5">
                            <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 border border-white/10 hover:border-sky-400/60 hover:bg-slate-900">
                                <Bell className="h-4 w-4 text-slate-200" />
                                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[0.6rem] font-semibold">
                                    1
                                </span>
                            </button>

                            <button className="flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1.5 text-xs border border-white/10 hover:border-sky-400/60 hover:bg-slate-900">
                               <span className="truncate max-w-[130px] text-slate-100">
                                  {email || "User"}
                                </span>
                                <ChevronDown className="h-4 w-4 text-slate-300" />
                            </button>

                            <button
                                onClick={handleLogout}
                                className="
    flex items-center gap-2
    rounded-full
    bg-red-600/90 hover:bg-red-500
    px-4 py-2
    text-sm font-medium text-white
    border border-red-400/60
    shadow-[0_0_20px_rgba(239,68,68,0.6)]
    transition-all duration-300
    hover:scale-105 hover:shadow-[0_0_25px_rgba(239,68,68,0.9)]
  "
                            >
                                <Power size={18} />
                                Çıkış Yap
                            </button>
                        </div>
                    </header>

                    {/* CAM PANEL + SAYFA İÇERİĞİ */}
                    <main className="flex-1">
                        <div className="h-full w-full rounded-3xl border border-white/10 bg-slate-900/40 shadow-[0_0_45px_rgba(15,23,42,0.9)] backdrop-blur-2xl p-6">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;