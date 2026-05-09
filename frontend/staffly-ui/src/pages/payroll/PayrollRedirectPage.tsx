import { Navigate } from "react-router-dom";
import { ROLE_EMPLOYEE, ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_ACCOUNTING, hasAnyRole } from "../../utils/auth";

const PayrollRedirectPage = () => {
    if (hasAnyRole([ROLE_EMPLOYEE])) {
        return <Navigate to="/app/payroll/salary-tracking" replace />;
    }

    if (hasAnyRole([ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_ACCOUNTING])) {
        return <Navigate to="/app/payroll/salary-assignment" replace />;
    }

    if (hasAnyRole([ROLE_SYSTEM_ADMIN, ROLE_HR_MANAGER, ROLE_ACCOUNTING])) {
        return <Navigate to="/app/payroll/advance-requests" replace />;
    }

    return <Navigate to="/app" replace />;
};

export default PayrollRedirectPage;
