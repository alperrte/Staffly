import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import MainLayout from "./layout/MainLayout";
import EmployeeListPage from "./pages/employee/EmployeeListPage";
import CreateEmployeePage from "./pages/employee/CreateEmployeePage";
//Push

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ROOT → LOGIN */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* LOGIN */}
                <Route path="/login" element={<LoginPage />} />

                {/* APP */}
                <Route path="/app" element={<MainLayout />}>
                    <Route index element={<div>Dashboard</div>} />

                    {/* 🔥 BURASI ÖNEMLİ */}
                    <Route path="employees" element={<EmployeeListPage />} />
                    <Route path="employees/create" element={<CreateEmployeePage />} />

                    <Route path="departments" element={<div>Departments</div>} />
                    <Route path="users" element={<div>Users</div>} />
                    <Route path="settings" element={<div>Settings</div>} />
                </Route>

                {/* FALLBACK */}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;