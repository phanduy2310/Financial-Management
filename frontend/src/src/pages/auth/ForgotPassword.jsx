import React, { useState } from "react";
import AuthLayout from "../../layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import axios from "../../api/axios";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/auth/forgot", { email });
            setMessage("Đã gửi email đặt lại mật khẩu!");
        } catch {
            setMessage("Email không tồn tại!");
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-center text-[#CE1126] mb-6">
                Quên mật khẩu
            </h2>

            {message && (
                <p className="text-center text-[#CE1126] mb-3">{message}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Nhập email của bạn"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@ptit.edu.vn"
                />

                <Button
                    label="Gửi yêu cầu"
                    className="bg-[#CE1126] hover:bg-red-700 text-white w-full py-3 text-lg"
                />
            </form>
        </AuthLayout>
    );
}
