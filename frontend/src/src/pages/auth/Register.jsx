import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import axios from "../../api/axios";

export default function Register() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        fullname: "",
        email: "",
        password: "",
        role: "user", // mặc định là user
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await axios.post("/auth/register", form);
            navigate("/auth/login");
        } catch (err) {
            setError(err.response?.data?.message || "Đăng ký không thành công");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-3xl font-bold text-center text-[#CE1126] mb-6">
                Tạo tài khoản mới
            </h2>

            {error && (
                <p className="text-red-600 text-sm text-center mb-3">{error}</p>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
                <Input
                    name="fullname"
                    label="Họ tên"
                    placeholder="Nguyễn Văn A"
                    onChange={handleChange}
                    required
                />

                <Input
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="student@ptit.edu.vn"
                    onChange={handleChange}
                    required
                />

                <Input
                    name="password"
                    label="Mật khẩu"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    required
                />

                {/* ================== CHỌN ROLE ================== */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Bạn là
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="role"
                                value="user"
                                checked={form.role === "user"}
                                onChange={handleChange}
                            />
                            <span>Người dùng</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="role"
                                value="parent"
                                checked={form.role === "parent"}
                                onChange={handleChange}
                            />
                            <span>Phụ huynh</span>
                        </label>
                    </div>
                </div>

                <Button
                    disabled={loading}
                    className="bg-[#CE1126] hover:bg-red-700 text-white w-full py-3 text-lg"
                >
                    {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
                </Button>

                <p className="text-center text-sm mt-2">
                    Đã có tài khoản?{" "}
                    <Link
                        to="/auth/login"
                        className="text-[#CE1126] hover:underline"
                    >
                        Đăng nhập
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
