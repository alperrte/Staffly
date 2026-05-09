import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { getTokenRoles, hasAnyRole } from "../../utils/auth";

type ProtectedRouteProps = {
    children: ReactNode;
    allowedRoles?: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const location = useLocation();
    const tokenRoles = getTokenRoles();

    if (!localStorage.getItem("token")) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
        return <Navigate to="/app" replace />;
    }

    if (!tokenRoles.length) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
