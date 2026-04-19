import { NavLink, useNavigate } from "react-router-dom";
import { BarChart2, Users, LogOut, ChartCandlestick } from "lucide-react";
import { useMemo } from "react";
import { getUserName, getEmail } from "../utils/auth";

export default function ParentSidebar({ collapsed = false }) {
    const navigate = useNavigate();

    const userName = useMemo(() => getUserName(), []);
    const userEmail = useMemo(() => getEmail(), []);

    const avatarName = useMemo(() => {
        if (!userName) return "Parent";
        const parts = userName.trim().split(/\s+/);
        return parts[parts.length - 1];
    }, [userName]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        navigate("/auth/login");
        window.location.reload();
    };

    const linkBase =
        "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 group";
    const hoverStyle = "hover:bg-white/10 hover:translate-x-1";
    const activeStyle = "bg-white/20 text-white shadow-md";

    return (
        <aside
            className={`
                bg-gradient-to-b from-primary-700 to-primary-800
                text-white flex flex-col justify-between
                transition-all duration-300 shadow-large
                ${collapsed ? "w-20" : "w-64"}
            `}
        >
            {/* 👤 USER INFO */}
            <div>
                <div className="flex items-center gap-3 p-5 border-b border-white/10">
                    {collapsed ? (
                        <div className="p-2 bg-white/10 rounded-lg">
                            <ChartCandlestick size={24} />
                        </div>
                    ) : (
                        <>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    avatarName
                                )}&background=fff&color=CE1126&size=128&bold=true`}
                                alt="avatar"
                                className="w-11 h-11 rounded-full border-2 border-white/20 shadow"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">
                                    {userName || "Phụ huynh"}
                                </p>
                                <p className="text-xs opacity-75 truncate">
                                    {userEmail || "parent"}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* 🧭 MENU */}
                <nav className="flex flex-col p-4 space-y-1">
                    <NavLink
                        to="/parent"
                        end
                        className={({ isActive }) =>
                            `${linkBase} ${hoverStyle} ${
                                isActive ? activeStyle : "text-white/90"
                            }`
                        }
                    >
                        <BarChart2 size={20} />
                        {!collapsed && <span>Tổng quan</span>}
                    </NavLink>

                    <NavLink
                        to="/parent/children"
                        className={({ isActive }) =>
                            `${linkBase} ${hoverStyle} ${
                                isActive ? activeStyle : "text-white/90"
                            }`
                        }
                    >
                        <Users size={20} />
                        {!collapsed && <span>Danh sách con</span>}
                    </NavLink>
                </nav>
            </div>

            {/* ⚙️ FOOTER */}
            {!collapsed ? (
                <div className="flex items-center justify-between border-t border-white/10 p-4 text-xs opacity-80">
                    <span className="text-white/70">© 2026 PTIT</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
                    >
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            ) : (
                <div className="flex justify-center border-t border-white/10 p-4">
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="Đăng xuất"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            )}
        </aside>
    );
}
