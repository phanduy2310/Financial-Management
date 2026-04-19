import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, roles }) {
    const token = localStorage.getItem("accessToken");
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (error) {
        user = null;
    }

    if (!token || !user) return <Navigate to="/auth/login" replace />;

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/app" replace />;
    }

    return children;
}
