import React, { useState, useEffect, useMemo } from "react";
import {
    LayoutDashboard,
    ClipboardMinus,
    Settings,
    BadgeDollarSign,
    ChevronDown,
    ChevronRight,
    LogOut,
    BanknoteArrowUp,
    BanknoteArrowDown,
    TrendingUp,
    Wallet,
    UsersRound,
    ChartCandlestick,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getUserName, getEmail } from "../utils/auth";

export default function Sidebar({ collapsed }) {
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();

    // Đăng xuất người dùng

    const navigate = useNavigate();

    // Lấy thông tin user từ token
    const userName = useMemo(() => getUserName(), []);
    const userPhone = useMemo(() => getEmail(), []);

    // Tạo avatar URL từ tên user
    const avatarName = useMemo(() => {
        if (!userName) return "User";
        // Lấy chữ cái đầu của từ cuối cùng trong tên
        const nameParts = userName.trim().split(/\s+/);
        return nameParts[nameParts.length - 1] || "User";
    }, [userName]);

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        // await axios.post("/auth/logout", {}, { withCredentials: true });
        navigate("/auth/login");
        window.location.reload();
    };

    // 🧠 Tự mở nhóm đúng theo URL
    useEffect(() => {
        if (location.pathname.includes("transactions"))
            setOpenMenus({ Transactions: true });
        else if (location.pathname.includes("saving"))
            setOpenMenus({ SavingPlans: true });
        else if (location.pathname.includes("installments"))
            setOpenMenus({ Installments: true });
        else setOpenMenus({});
    }, [location.pathname]);

    // 🧹 Khi collapse → đóng tất cả
    useEffect(() => {
        if (collapsed) setOpenMenus({});
    }, [collapsed]);

    const toggleMenu = (key) => setOpenMenus((prev) => ({ [key]: !prev[key] }));

    // 📁 Cấu trúc menu chính
    const menuItems = [
        {
            name: "Tổng quan",
            href: "",
            icon: <LayoutDashboard size={20} />,
        },
        {
            name: "Giao dịch",
            key: "Transactions",
            icon: <BadgeDollarSign size={20} />,
            children: [
                {
                    name: "Thu nhập",
                    href: "transactions/income",
                    icon: <BanknoteArrowUp size={18} />,
                },
                {
                    name: "Chi tiêu",
                    href: "transactions/expense",
                    icon: <BanknoteArrowDown size={18} />,
                },
            ],
        },
        {
            name: "Kế hoạch tiết kiệm",
            key: "SavingPlans",
            icon: <ClipboardMinus size={20} />,
            children: [
                {
                    name: "Tổng quan",
                    href: "saving",
                    icon: <LayoutDashboard size={18} />,
                },
                {
                    name: "Kế hoạch của tôi",
                    href: "saving/list",
                    icon: <TrendingUp size={18} />,
                },
            ],
        },
        {
            name: "Trả góp",
            key: "Installments",
            icon: <Wallet size={20} />,
            children: [
                {
                    name: "Tổng quan",
                    href: "installments/dashboard",
                    icon: <LayoutDashboard size={18} />,
                },
                {
                    name: "Trả góp của tôi",
                    href: "installments",
                    icon: <TrendingUp size={18} />,
                },
            ],
        },
        {
            name: "Nhóm",
            key: "Groups",
            href: "groups",
            icon: <UsersRound />,
        },
        {
            name: "Cài đặt",
            href: "settings",
            icon: <Settings size={20} />,
        },
    ];

    // 🎨 Class chung
    const linkBase =
        "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all duration-200 group";
    const hoverStyle = "hover:bg-white/10 hover:translate-x-1";
    const activeStyle = "bg-white/20 text-white shadow-md";

    // ⚙️ Render từng item
    const renderMenuItem = (item) => {
        if (item.children) {
            const isOpen = openMenus[item.key || item.name];
            return (
                <div key={item.name} className="space-y-1">
                    {/* Nhóm header */}
                    <div
                        onClick={() => toggleMenu(item.key || item.name)}
                        className={`${linkBase} cursor-pointer ${hoverStyle} ${
                            isOpen ? "bg-white/10" : ""
                        }`}
                    >
                        <span className="group-hover:scale-110 transition-transform duration-200">
                            {item.icon}
                        </span>
                        {!collapsed && (
                            <span className="flex-1">{item.name}</span>
                        )}
                        {!collapsed && (
                            <span className={`transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                            }`}>
                                <ChevronDown size={16} />
                            </span>
                        )}
                    </div>

                    {/* Submenu */}
                    {!collapsed && isOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/20 pl-4 animate-slide-down">
                            {item.children.map((child) => (
                                <NavLink
                                    key={child.name}
                                    to={child.href}
                                    end
                                    className={({ isActive }) =>
                                        `${linkBase} ${hoverStyle} ${
                                            isActive ? activeStyle : "text-white/80"
                                        }`
                                    }
                                >
                                    <span className="group-hover:scale-110 transition-transform duration-200">
                                        {child.icon}
                                    </span>
                                    {child.name}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <NavLink
                key={item.name}
                to={item.href}
                end
                className={({ isActive }) =>
                    `${linkBase} ${hoverStyle} ${
                        isActive ? activeStyle : "text-white/90"
                    }`
                }
            >
                <span className="group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                </span>
                {!collapsed && <span>{item.name}</span>}
            </NavLink>
        );
    };

    return (
        <aside
            className={`bg-gradient-to-b from-primary-700 to-primary-800 text-white flex flex-col justify-between transition-all duration-300 shadow-large ${
                collapsed ? "w-20" : "w-64"
            }`}
        >
            {/* 👤 USER INFO */}
            <div>
                <div className="flex justify-center items-center p-5 border-b border-white/10">
                    {collapsed ? (
                        <div className="p-2 bg-white/10 rounded-lg">
                            <ChartCandlestick size={24} />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 w-full">
                            <div className="relative">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=fff&color=CE1126&size=128&bold=true`}
                                    alt="avatar"
                                    className="w-12 h-12 rounded-full shadow-md border-2 border-white/20"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary-700"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">
                                    {userName || "Người dùng"}
                                </p>
                                <p className="text-xs opacity-75 truncate">
                                    {userPhone || "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 🧭 MENU */}
                <nav className="flex flex-col p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
                    {menuItems.map(renderMenuItem)}
                </nav>
            </div>

            {/* ⚙️ FOOTER */}
            {!collapsed && (
                <div className="flex items-center justify-between border-t border-white/10 p-4 text-xs opacity-80">
                    <span className="text-white/70">© 2026 PTIT</span>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 text-white/90 hover:text-white"
                        onClick={handleLogout}
                    >
                        <LogOut size={16} /> Đăng xuất
                    </button>
                </div>
            )}
            {collapsed && (
                <div className="flex justify-center border-t border-white/10 p-4">
                    <button
                        className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                        onClick={handleLogout}
                        title="Đăng xuất"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            )}
        </aside>
    );
}
