import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ParentSidebar from "../components/ParentSidebar";
import Header from "../layout/Header";

export default function ParentLayout() {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* HEADER */}
            <Header collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* BODY */}
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <ParentSidebar collapsed={collapsed} />

                {/* MAIN CONTENT */}
                <main
                    className="
                               flex-1 
                               relative            
                               overflow-y-auto 
                               bg-gradient-to-br from-gray-50 via-white to-gray-50
                               px-6 py-8 
                               custom-scrollbar
                               animate-fade-in"
                >
                    <div className="min-h-full pb-16 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
