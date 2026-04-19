import React from "react";

export default function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[400px] p-6 animate-fadeIn">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-lg font-bold text-gray-700">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-600 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div>{children}</div>
            </div>
        </div>
    );
}
