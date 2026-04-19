import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChartCandlestick, Menu, Bell, Search } from "lucide-react";
import { getUserName } from "../utils/auth";
import axios from "../api/axios";
import { motion } from "framer-motion";

import NotificationDropdown from "../components/NotificationDropdown";
import useNotificationStream from "../hooks/useNotificationStream";

export default function Header({ collapsed, setCollapsed }) {
    const [unreadCount, setUnreadCount] = useState(0);
    const [openNotif, setOpenNotif] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    // SSE Notifications - GIỮ NGUYÊN LOGIC
    useNotificationStream((data) => {
        if (data.type === "NEW_NOTIFICATION") {
            setNotifications((prev) => {
                if (prev.some((n) => n.id === data.notification.id))
                    return prev;
                return [data.notification, ...prev];
            });
            setUnreadCount((c) => c + 1);
        }
    });

    const handleConfirmParent = async (notif, action) => {
        try {
            await axios.post("/parent/confirm", {
                token: notif.data?.token,
                action,
            });
            await axios.post(`/notification/${notif.id}/read`);
            setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
            setUnreadCount((c) => Math.max(0, c - 1));
            setOpenNotif(false);
            // Child xác nhận → ở lại trang hiện tại, không redirect sang route của parent
        } catch (err) {
            console.error("Xác nhận thất bại", err);
        }
    };

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await axios.get("/notification/unread-count");
                setUnreadCount(response.data.count);
            } catch (error) {
                console.error(error);
                setUnreadCount(0);
            }
        };
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        if (!openNotif) return;
        const fetchNotifications = async () => {
            try {
                const res = await axios.get("/notification?limit=5");
                setNotifications(res.data.data || []);
            } catch (error) {
                console.error(error);
                setNotifications([]);
            }
        };
        fetchNotifications();
    }, [openNotif]);

    const handleRead = async (notif) => {
        try {
            if (!notif.is_read) {
                await axios.post(`/notification/${notif.id}/read`);
                setUnreadCount((c) => Math.max(0, c - 1));
            }
        } catch (error) {
            console.error(error);
        }
        setOpenNotif(false);
    };

    const userName = useMemo(() => getUserName(), []);
    const displayName = useMemo(() => {
        if (!userName) return "Bạn";
        const nameParts = userName.trim().split(/\s+/);
        return nameParts[nameParts.length - 1] || "Bạn";
    }, [userName]);

    return (
        <header className="flex items-center justify-between bg-white border-b border-gray-100 px-8 h-[90px] sticky top-0 z-[60] shadow-sm shadow-gray-200/50">
            {/* Left Section: Branding & Toggle */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 pr-6 border-r border-gray-100">
                    <div className="p-2.5 bg-[#CE1126] rounded-xl shadow-lg shadow-red-100">
                        <ChartCandlestick size={22} className="text-white" />
                    </div>
                    <div className="hidden lg:block">
                        <h1 className="text-lg font-black text-gray-900 leading-none tracking-tighter uppercase">
                            PTIT <span className="text-[#CE1126]">Finance</span>
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Quản lý tài chính 
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-[#CE1126] transition-all duration-200"
                >
                    <Menu size={22} />
                </button>
            </div>

            {/* Middle Section: Search Bar (PTIT Styled) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full group">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#CE1126] transition-colors"
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm giao dịch, báo cáo..."
                        className="w-full bg-gray-50 border-gray-100 border focus:border-[#CE1126]/30 focus:bg-white focus:ring-4 focus:ring-[#CE1126]/5 rounded-xl py-2.5 pl-12 pr-4 outline-none text-sm font-medium transition-all"
                    />
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setOpenNotif((o) => !o)}
                        className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                            openNotif
                                ? "bg-red-50 text-[#CE1126]"
                                : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        }`}
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#CE1126] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </motion.button>

                    <NotificationDropdown
                        open={openNotif}
                        onClose={() => setOpenNotif(false)}
                        notifications={notifications}
                        onRead={handleRead}
                        onConfirmParent={handleConfirmParent}
                    />
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            Chào mừng,
                        </span>
                        <span className="text-sm font-bold text-gray-900 uppercase italic">
                            {displayName}
                        </span>
                    </div>

                    <div className="relative group cursor-pointer">
                        <div className="w-11 h-11 rounded-xl p-[2px] bg-gradient-to-tr from-[#CE1126] to-red-400 transition-transform duration-300 group-hover:rotate-3">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    displayName
                                )}&background=fff&color=CE1126&bold=true&size=128`}
                                alt="avatar"
                                className="w-full h-full rounded-[9px] object-cover border-2 border-white"
                            />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                </div>
            </div>
        </header>
    );
}
