import React, { useState, useCallback, memo } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

// Memoize để tránh re-render khi nội dung chính thay đổi
const MemoSidebar = memo(Sidebar);
const MemoHeader = memo(Header);

export default function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = useCallback(() => {
        setCollapsed((prev) => !prev);
    }, []);

    return (
        <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
            <MemoHeader collapsed={collapsed} setCollapsed={toggleSidebar} />

            <div className="flex flex-1 overflow-hidden">
                <MemoSidebar collapsed={collapsed} />

                <main className="flex-1 relative overflow-y-auto bg-[#f8fafc] custom-scrollbar">
                    {/* Thêm transition nhẹ khi chuyển trang */}
                    <div className="min-h-full p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
