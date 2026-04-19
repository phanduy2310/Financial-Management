import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const MONTHS = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

/**
 * MonthPicker — dùng chung cho Dashboard, IncomeDashboard, ExpenseDashboard
 * Props: month (1-12), year, onChange({ month, year })
 */
export default function MonthPicker({ month, year, onChange }) {
    const now = new Date();
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

    const prev = () => {
        if (month === 1) onChange({ month: 12, year: year - 1 });
        else onChange({ month: month - 1, year });
    };

    const next = () => {
        // Không cho chọn tháng tương lai
        if (isCurrentMonth) return;
        if (month === 12) onChange({ month: 1, year: year + 1 });
        else onChange({ month: month + 1, year });
    };

    const goToNow = () => onChange({ month: now.getMonth() + 1, year: now.getFullYear() });

    return (
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm select-none">
            <CalendarDays size={16} className="text-slate-400 shrink-0" />

            <button
                onClick={prev}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all"
                aria-label="Tháng trước"
            >
                <ChevronLeft size={16} />
            </button>

            <span className="text-sm font-black text-slate-800 min-w-[110px] text-center tracking-tight">
                {MONTHS[month - 1]} {year}
            </span>

            <button
                onClick={next}
                disabled={isCurrentMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Tháng sau"
            >
                <ChevronRight size={16} />
            </button>

            {!isCurrentMonth && (
                <button
                    onClick={goToNow}
                    className="ml-1 text-[10px] font-black text-red-700 bg-red-50 px-2.5 py-1 rounded-full uppercase tracking-wider hover:bg-red-700 hover:text-white transition-all"
                >
                    Hôm nay
                </button>
            )}
        </div>
    );
}
