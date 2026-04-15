import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import MainLayout from "./layout/MainLayout";
import CvServicePage from "./pages/cvService/CvServicePage";

import EmployeeListPage from "./pages/employee/EmployeeListPage";
import CreateEmployeePage from "./pages/employee/CreateEmployeePage";


import UserPage from "./pages/userService/UserPage";

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

                    {/* Dashboard */}
                    <Route index element={<div>Dashboard</div>} />

                    {/* EMPLOYEE */}
                    <Route path="employees" element={<EmployeeListPage />} />
                    <Route path="employees/create" element={<CreateEmployeePage />} />

                    {/* DEPARTMENT */}
                    <Route path="departments" element={<div>Departments</div>} />

                    {/* USER */}
                    <Route path="users" element={<UserPage />} />

                    {/* CV */}
                    <Route path="applications" element={<CvServicePage />} />

                    {/* SETTINGS */}
                    <Route path="settings" element={<div>Settings</div>} />

                </Route>

                {/* FALLBACK */}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;