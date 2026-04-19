import React from "react";
import background from "../assets/background.webp";

export default function AuthLayout({ children }) {
    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed p-4"
            style={{
                backgroundImage: `linear-gradient(135deg, rgba(206,17,38,0.9) 0%, rgba(142,14,29,0.95) 100%), url(${background})`,
            }}
        >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-large p-8 animate-slide-up">
                {children}
            </div>
        </div>
    );
}
