import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import AuthLayout from "../../layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import loginImg from "../../assets/login.png";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post("/auth/login", form, {
                withCredentials: true,
            });

            const { accessToken, user } = res.data.data;

            // 1️⃣ Lưu token & user
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("user", JSON.stringify(user));

            // 2️⃣ Redirect theo role
            if (user.role === "parent") {
                navigate("/parent");
            } else {
                navigate("/app");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Đăng nhập thất bại");
        }
    };

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
                    <img src={loginImg} alt="Login" className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Đăng nhập hệ thống
                </h2>
                <p className="text-gray-600 text-sm">Chào mừng bạn trở lại!</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Email"
                    type="email"
                    name="email"
                    placeholder="student@ptit.edu.vn"
                    value={form.email}
                    onChange={handleChange}
                    error={error && !form.email ? "Vui lòng nhập email" : ""}
                />

                <Input
                    label="Mật khẩu"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    error={
                        error && !form.password ? "Vui lòng nhập mật khẩu" : ""
                    }
                />

                <Button variant="primary" size="lg" className="w-full">
                    Đăng nhập
                </Button>

                <div className="text-center text-sm mt-4">
                    <Link
                        to="/auth/forgot"
                        className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-colors"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-center text-sm text-gray-600">
                        Chưa có tài khoản?{" "}
                        <Link
                            to="/auth/register"
                            className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-colors"
                        >
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
