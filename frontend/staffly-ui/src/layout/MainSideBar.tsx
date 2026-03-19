import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaHeadset,
  FaCog,
} from "react-icons/fa";
import stafflyLogo from "../assets/logo.png";

const linkBase =
    "flex items-center gap-3 p-2.5 rounded-lg text-sm transition-colors";
const linkInactive = "text-slate-300 hover:bg-[#1E293B]";
const linkActive =
    "bg-[#1E293B] text-white shadow-[0_0_18px_rgba(15,23,42,0.8)]";
//Push

const Sidebar = () => {
  return (
      <aside className="w-64 h-screen bg-[#020617]/95 border-r border-slate-800/80 text-gray-300 flex flex-col p-4">
        {/* SOL ÜST: LOGO + YAZI */}
        <div className="mb-8 flex items-center gap-3 px-1">
          <div className="h-10 w-10 rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/60 shadow-[0_0_18px_rgba(15,23,42,0.9)] flex items-center justify-center">
            <img
                src={stafflyLogo}
                alt="Staffly Logo"
                className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
          <span className="text-[0.75rem] font-semibold tracking-[0.25em] text-white/95">
            STAFFLY
          </span>
            <span className="text-[0.6rem] font-medium tracking-[0.25em] text-sky-400/80 uppercase">
            HR MANAGEMENT SYSTEM
          </span>
          </div>
        </div>

        {/* MENÜ */}
        <nav className="flex flex-col gap-1 text-sm">
          <NavLink
              to="/app"
              end
              className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
          >
            <FaHome /> Ana Sayfa
          </NavLink>

          <NavLink
              to="/app/employees"
              className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
          >
            <FaUsers /> Çalışanlar
          </NavLink>

          <NavLink
              to="/app/departments"
              className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
          >
            <FaBuilding /> Departmanlar
          </NavLink>

          <NavLink
              to="/app/users"
              className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
          >
            <FaUsers /> Kullanıcılar
          </NavLink>








          <NavLink
              to="/app/support"
              className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
          >
            <FaHeadset /> Destek
          </NavLink>

        </nav>

        {/* ALT SETTINGS */}
        <div className="mt-auto pt-4 border-t border-slate-800/70">
          <NavLink
              to="/app/settings"
              className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
          >
            <FaCog /> Ayarlar
          </NavLink>
        </div>
      </aside>
  );
};

export default Sidebar;