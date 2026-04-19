export default function ParentDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-primary-700 mb-6">Tổng quan</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Tổng số con đang theo dõi
                    </p>
                    <p className="text-3xl font-bold mt-2">—</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Tổng chi tiêu tháng này
                    </p>
                    <p className="text-3xl font-bold mt-2 text-red-600">— đ</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Tổng thu nhập</p>
                    <p className="text-3xl font-bold mt-2 text-green-600">
                        — đ
                    </p>
                </div>
            </div>
        </div>
    );
}
