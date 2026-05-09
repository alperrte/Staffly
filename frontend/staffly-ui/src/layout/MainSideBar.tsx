import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
    FaHome,
    FaUsers,
    FaBuilding,
    FaHeadset,
    FaCog,
    FaUser,
    FaTasks,
    FaFileAlt,
    FaMoneyBillWave,
    FaClipboardList,
    FaBus,
    FaCalendarAlt,
    FaPowerOff,
} from "react-icons/fa";
import stafflyLogo from "../assets/logo.png";

const linkBase =
    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200";

const linkInactive =
    "text-slate-400 hover:bg-slate-800/70 hover:text-white";

const linkActive =
    "bg-sky-500/15 text-white border border-sky-400/30 shadow-[0_0_18px_rgba(14,165,233,0.22)]";

const Sidebar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    let roles = [];

    if (token) {
        try {
            const decoded = jwtDecode(token);
            roles = decoded.roles || [];
        } catch (e) {
            roles = [];
        }
    }

    const hasRole = (allowedRoles) => {
        return roles.some((role) => allowedRoles.includes(role));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        sessionStorage.clear();

        navigate("/login", { replace: true });
    };

    return (
        <aside className="flex h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-slate-950/95 p-4 text-gray-300 shadow-[18px_0_50px_rgba(2,6,23,0.45)]">
            <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/45 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-sky-400/40 bg-slate-950 shadow-[0_0_24px_rgba(14,165,233,0.45)]">
                        <img
                            src={stafflyLogo}
                            alt="Staffly Logo"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="min-w-0">
                        <div className="text-sm font-bold tracking-[0.35em] text-white">
                            STAFFLY
                        </div>
                        <div className="mt-1 text-[0.58rem] font-medium tracking-[0.28em] text-sky-300 uppercase">
                            HR MANAGEMENT SYSTEM
                        </div>
                    </div>
                </div>
            </div>

            <nav className="staffly-scroll min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-1 pb-4">
                <NavLink to="/app" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaHome /> Ana Sayfa
                </NavLink>

                {hasRole(["ROLE_SYSTEM_ADMIN", "ROLE_HR_MANAGER", "ROLE_DEPARTMENT_MANAGER"]) && (
                    <NavLink to="/app/employees" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaUsers /> Çalışanlar
                    </NavLink>
                )}

                <NavLink to="/app/payroll" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaMoneyBillWave /> Maaş & Bordro
                </NavLink>

                <NavLink to="/app/leaveService" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaFileAlt /> İzin Talepleri
                </NavLink>

                <NavLink to="/app/transport" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaBus /> Ulaşım
                </NavLink>

                {hasRole(["ROLE_SYSTEM_ADMIN", "ROLE_HR_MANAGER"]) && (
                    <NavLink to="/app/applications" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaFileAlt /> Başvurular
                    </NavLink>
                )}

                {hasRole(["ROLE_SYSTEM_ADMIN"]) && (
                    <NavLink to="/app/departments/manage" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaBuilding /> Departman Yönetimi
                    </NavLink>
                )}

                {hasRole(["ROLE_HR_MANAGER", "ROLE_DEPARTMENT_MANAGER"]) && (
                    <NavLink to="/app/departments" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaBuilding /> Departmanlar
                    </NavLink>
                )}

                <NavLink to="/app/tasks" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaTasks /> Görevler
                </NavLink>

                <NavLink to="/app/tasks/mytasks" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaClipboardList /> Görevlerim
                </NavLink>

                {hasRole(["ROLE_SYSTEM_ADMIN"]) && (
                    <NavLink to="/app/users" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaUsers /> Kullanıcılar
                    </NavLink>
                )}

                {hasRole(["ROLE_SYSTEM_ADMIN", "ROLE_HR_MANAGER"]) && (
                    <NavLink to="/app/job-postings" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaFileAlt /> İş İlanları
                    </NavLink>
                )}

                {hasRole(["ROLE_SYSTEM_ADMIN", "ROLE_HR_MANAGER", "ROLE_DEPARTMENT_MANAGER"]) && (
                    <NavLink to="/app/work-schedules" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaCalendarAlt /> Çalışma Takvimi
                    </NavLink>
                )}

                {hasRole(["ROLE_SYSTEM_ADMIN", "ROLE_HR_MANAGER", "ROLE_DEPARTMENT_MANAGER"]) && (
                    <NavLink to="/app/meetings" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaCalendarAlt /> Toplantı Planlama
                    </NavLink>
                )}

                {hasRole(["ROLE_SYSTEM_ADMIN", "ROLE_HR_MANAGER", "ROLE_DEPARTMENT_MANAGER", "ROLE_EMPLOYEE"]) && (
                    <NavLink to="/app/my-schedule" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                        <FaCalendarAlt /> Takvimim
                    </NavLink>
                )}

                <NavLink to="/app/support" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaHeadset /> Destek
                </NavLink>
                </div>

                <NavLink
                    to="/app/support/all"
                    className={({ isActive }) =>
                        `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                >
                    <FaHeadset /> Destek Yönetimi
                </NavLink>
            </nav>

            <div className="shrink-0 border-t border-white/10 pt-4">
                <NavLink to="/app/profile" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaUser /> Profil
                </NavLink>

                <NavLink to="/app/settings" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : linkInactive}`}>
                    <FaCog /> Ayarlar
                </NavLink>

                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-red-400/40 bg-red-500/10 px-3 py-3 text-sm font-semibold text-red-200 transition-all duration-200 hover:bg-red-500/20 hover:text-white hover:shadow-[0_0_22px_rgba(239,68,68,0.35)]"
                >
                    <FaPowerOff />
                    Çıkış Yap
                </button>
            </div>
            {showLogoutModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-6 shadow-[0_0_60px_rgba(15,23,42,0.9)]">
                        <div className="mb-5 flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10">
                                <FaPowerOff className="text-2xl text-red-400" />
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Çıkış Yap
                                </h2>

                                <p className="mt-1 text-sm text-slate-400">
                                    Oturumunuzu kapatmak istediğinize emin misiniz?
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                            >
                                Vazgeç
                            </button>

                            <button
                                onClick={handleLogout}
                                className="rounded-2xl border border-red-400/30 bg-red-500/15 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/25 hover:text-white hover:shadow-[0_0_25px_rgba(239,68,68,0.35)]"
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </aside>
    );
};

export default Sidebar;