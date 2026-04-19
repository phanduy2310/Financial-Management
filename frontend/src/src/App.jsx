import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Layout chính
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";

// Transaction
import IncomeDashboard from "./pages/IncomeDashboard";
import ExpenseDashboard from "./pages/ExpenseDashboard";

// Saving
import SavingDashboard from "./pages/SavingDashboard";
import SavingList from "./pages/saving/SavingList";
import SavingDetail from "./pages/saving/SavingDetail";

// Installments
import InstallmentDashboard from "./pages/InstallmentDashboard";
import InstallmentList from "./pages/InstallmentList";
import InstallmentDetail from "./pages/InstallmentDetail";

// Budget
import BudgetList from "./pages/budget/BudgetList";

// Group
import GroupList from "./pages/group/GroupList";
import GroupDetail from "./pages/group/GroupDetail";
import Settings from "./pages/Settings";

/* ===================== PARENT ===================== */
import ParentLayout from "./layout/ParentLayout";
import ParentDashboard from "./pages/parent/ParentDashboard";
import ChildrenList from "./pages/parent/ChildrenList";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect root → login */}
                <Route
                    path="/"
                    element={<Navigate to="/auth/login" replace />}
                />

                {/* Auth */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/forgot" element={<ForgotPassword />} />
                <Route path="/auth/reset/:token" element={<ResetPassword />} />

                {/* Private Routes */}
                <Route
                    path="/app"
                    element={
                        <ProtectedRoute>
                            <Homepage />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />

                    {/* Transaction */}
                    <Route
                        path="transactions/income"
                        element={<IncomeDashboard />}
                    />
                    <Route
                        path="transactions/expense"
                        element={<ExpenseDashboard />}
                    />

                    {/* Saving */}
                    <Route path="saving" element={<SavingDashboard />} />
                    <Route path="saving/list" element={<SavingList />} />
                    <Route path="saving/:id" element={<SavingDetail />} />

                    {/* Installments */}
                    <Route
                        path="installments/dashboard"
                        element={<InstallmentDashboard />}
                    />
                    <Route path="installments" element={<InstallmentList />} />
                    <Route
                        path="installments/:id"
                        element={<InstallmentDetail />}
                    />

                    {/* Budget */}
                    <Route path="budget" element={<BudgetList />} />

                    {/* Groups */}
                    <Route path="groups" element={<GroupList />} />
                    <Route path="groups/:groupId" element={<GroupDetail />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/app" replace />} />
                </Route>

                {/* ===================== PARENT ===================== */}
                <Route
                    path="/parent"
                    element={
                        <ProtectedRoute roles={["parent"]}>
                            <ParentLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<ParentDashboard />} />
                    <Route path="children" element={<ChildrenList />} />
                    <Route path="*" element={<Navigate to="/parent" replace />} />
                    {/*
                    <Route
                        path="children/:childId"
                        element={<ChildDetail />}
                    />
                    <Route
                        path="children/:childId/transactions"
                        element={<ChildTransactions />}
                    />
                    */}
                </Route>
                {/* ===================== FALLBACK ===================== */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
