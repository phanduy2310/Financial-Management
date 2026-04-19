import React, { useMemo } from "react";
import { Settings as SettingsIcon, Mail, Shield, User } from "lucide-react";
import { getEmail, getUserName } from "../utils/auth";

export default function Settings() {
    const userName = useMemo(() => getUserName(), []);
    const email = useMemo(() => getEmail(), []);
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || {};
        } catch (error) {
            return {};
        }
    }, []);

    return (
        <div className="space-y-6">
            <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#CE1126] flex items-center justify-center">
                        <SettingsIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            Cài đặt tài khoản
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Trang này dùng để xem nhanh thông tin tài khoản và
                            sẽ là nơi mở rộng các tùy chọn cá nhân sau.
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
                <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-gray-900 font-semibold">
                        <User size={18} className="text-[#CE1126]" />
                        Người dùng
                    </div>
                    <p className="mt-3 text-lg font-bold text-gray-900">
                        {userName || "Chưa có dữ liệu"}
                    </p>
                </article>

                <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-gray-900 font-semibold">
                        <Mail size={18} className="text-[#CE1126]" />
                        Email
                    </div>
                    <p className="mt-3 text-lg font-bold text-gray-900 break-all">
                        {email || "Chưa có dữ liệu"}
                    </p>
                </article>

                <article className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-gray-900 font-semibold">
                        <Shield size={18} className="text-[#CE1126]" />
                        Vai trò
                    </div>
                    <p className="mt-3 text-lg font-bold text-gray-900 uppercase">
                        {user.role || "USER"}
                    </p>
                </article>
            </section>
        </div>
    );
}
