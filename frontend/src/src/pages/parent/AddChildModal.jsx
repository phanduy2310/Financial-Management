import { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function AddChildModal({ open, onClose, onSuccess }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Tự động xóa dữ liệu khi đóng/mở modal
    useEffect(() => {
        if (!open) {
            setEmail("");
            setError("");
            setSuccess("");
        }
    }, [open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email) {
            setError("Vui lòng nhập email của con");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post("/parent/children", {
                child_email: email,
            });

            setSuccess(res.data.message || "Gửi lời mời thành công!");
            setEmail("");
            // Đợi 1.5s để người dùng thấy thông báo thành công rồi mới đóng
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || "Gửi lời mời thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop làm mờ nền */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Body */}
            <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
                {/* Header với màu Primary-700 nhẹ ở Border */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">
                        Thêm tài khoản con
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <p className="text-sm text-gray-500">
                        Nhập email tài khoản của con bạn. Chúng tôi sẽ gửi một
                        lời mời kết nối đến email này.
                    </p>

                    {/* Email Input Group */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Email của con
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                    />
                                </svg>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="con@gmail.com"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Thông báo Lỗi */}
                    {error && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700">
                            <svg
                                className="w-5 h-5 shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                    )}

                    {/* Thông báo Thành công */}
                    {success && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700">
                            <svg
                                className="w-5 h-5 shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="text-sm font-medium">
                                {success}
                            </span>
                        </div>
                    )}

                    {/* Nút bấm */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-primary-700 rounded-xl hover:bg-primary-800 shadow-lg shadow-primary-700/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                "Gửi lời mời"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
