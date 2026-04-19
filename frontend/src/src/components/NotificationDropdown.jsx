import React, { useEffect, useRef } from "react";

export default function NotificationDropdown({
    open,
    onClose,
    notifications,
    onRead,
    onConfirmParent,
}) {
    const ref = useRef(null);

    // Click outside → close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
        >
            <div className="px-4 py-3 border-b font-semibold text-gray-800">
                Thông báo
            </div>

            <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                        Không có thông báo mới
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`px-4 py-3 border-b last:border-b-0
                                ${!n.is_read ? "bg-primary-50" : "bg-white"}`}
                        >
                            <div className="flex items-start gap-2">
                                {!n.is_read && (
                                    <span className="mt-1 w-2 h-2 bg-primary-600 rounded-full"></span>
                                )}
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-800">
                                        {n.title}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                        {n.message}
                                    </div>

                                    {/* ACTION BUTTONS */}
                                    {n.event === "PARENT_LINK_REQUEST" && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() =>
                                                    onConfirmParent(
                                                        n,
                                                        "accepted"
                                                    )
                                                }
                                                className="px-3 py-1 text-xs font-semibold
                                                    bg-primary-600 text-white
                                                    rounded-lg hover:bg-primary-700"
                                            >
                                                Đồng ý
                                            </button>
                                            <button
                                                onClick={() =>
                                                    onConfirmParent(
                                                        n,
                                                        "rejected"
                                                    )
                                                }
                                                className="px-3 py-1 text-xs font-semibold
                                                    bg-gray-200 text-gray-700
                                                    rounded-lg hover:bg-gray-300"
                                            >
                                                Từ chối
                                            </button>
                                        </div>
                                    )}

                                    {/* NORMAL CLICK (non-action notif) */}
                                    {n.event !== "PARENT_LINK_REQUEST" && (
                                        <button
                                            onClick={() => onRead(n)}
                                            className="text-xs text-primary-600 mt-2"
                                        >
                                            Đánh dấu là đã đọc
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
