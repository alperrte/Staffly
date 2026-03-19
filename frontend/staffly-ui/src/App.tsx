import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import MainLayout from "./layout/MainLayout";
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
                    <Route index element={<div>Dashboard</div>} />
                    <Route path="employees" element={<div>Employees</div>} />
                    <Route path="departments" element={<div>Departments</div>} />
                    <Route path="users" element={<UserPage />} />
                    <Route path="settings" element={<div>Settings</div>} />
                </Route>

                {/* Diğer tüm url'ler login'e düşsün */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;