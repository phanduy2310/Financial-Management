import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import axios from "../../api/axios";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/auth/reset/${token}`, { password });
            navigate("/auth/login");
        } catch {
            alert("Token không hợp lệ hoặc đã hết hạn");
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-center text-[#CE1126] mb-6">
                Đặt lại mật khẩu
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    type="password"
                    label="Mật khẩu mới"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    label="Cập nhật mật khẩu"
                    className="bg-[#CE1126] hover:bg-red-700 text-white w-full py-3 text-lg"
                />
            </form>
        </AuthLayout>
    );
}
