import { useNavigate } from "react-router-dom";

export default function TopPlans({ data }) {
    const navigate = useNavigate();

    if (!data || data.length === 0) return null;

    const medals = ["🥇", "🥈", "🥉"];

    return (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                🏆 Top 3 kế hoạch tiết kiệm
            </h2>
            <div className="space-y-2">
                {data.map((plan, idx) => (
                    <button
                        key={plan.id}
                        type="button"
                        onClick={() => navigate(`/app/saving/${plan.id}`)}
                        className="w-full flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition text-left"
                    >
                        <span>
                            {medals[idx] || "•"}{" "}
                            {plan.title?.replace(/^mục\s+/i, "") ||
                                plan.title?.replace(/^muc\s+/i, "")}
                        </span>
                        <span className="font-bold text-red-600">
                            {plan.progress_percentage}%
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
