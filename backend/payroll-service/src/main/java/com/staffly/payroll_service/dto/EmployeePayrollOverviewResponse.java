package com.staffly.payroll_service.dto;

import com.staffly.payroll_service.entity.Payroll;
import com.staffly.payroll_service.entity.Salary;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class EmployeePayrollOverviewResponse {

    private Salary currentSalary;

    private Integer lastPayrollMonth;
    private Integer lastPayrollYear;
    private BigDecimal lastNetSalary;
    private BigDecimal lastBaseSalary;
    private BigDecimal lastTotalBonus;
    private BigDecimal lastTotalDeduction;
    private String lastPayrollStatus;

    private long payrollRecordCount;
    private long bonusEntryCount;
    private long deductionEntryCount;
    private long pendingAdvanceCount;
    private long approvedAdvanceCount;

    public static EmployeePayrollOverviewResponse from(
            Payroll last,
            Salary salary,
            long payrollCount,
            long bonusCount,
            long deductionCount,
            long pendingAdv,
            long approvedAdv
    ) {
        EmployeePayrollOverviewResponseBuilder b = builder()
                .currentSalary(salary)
                .payrollRecordCount(payrollCount)
                .bonusEntryCount(bonusCount)
                .deductionEntryCount(deductionCount)
                .pendingAdvanceCount(pendingAdv)
                .approvedAdvanceCount(approvedAdv);

        if (last != null) {
            b.lastPayrollMonth(last.getMonth())
                    .lastPayrollYear(last.getYear())
                    .lastNetSalary(last.getNetSalary())
                    .lastBaseSalary(last.getBaseSalary())
                    .lastTotalBonus(last.getTotalBonus())
                    .lastTotalDeduction(last.getTotalDeduction())
                    .lastPayrollStatus(last.getStatus());
        }
        return b.build();
    }
}
