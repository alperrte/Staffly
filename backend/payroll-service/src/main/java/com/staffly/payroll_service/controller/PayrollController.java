package com.staffly.payroll_service.controller;

import com.staffly.payroll_service.dto.EmployeePayrollOverviewResponse;
import com.staffly.payroll_service.dto.PayrollRequest;
import com.staffly.payroll_service.dto.PayrollResponse;
import com.staffly.payroll_service.dto.RejectAdvanceRequest;
import com.staffly.payroll_service.entity.*;
import com.staffly.payroll_service.repository.SalaryRepository;
import com.staffly.payroll_service.security.JwtService;
import com.staffly.payroll_service.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/payrolls")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final SalaryRepository salaryRepository; // 🔥 EKLEDİK
        private final JwtService jwtService;

        private Long extractEmployeeId(String authHeader) {
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                        throw new RuntimeException("Authorization token is required");
                }

                String jwt = authHeader.substring(7);
                Long employeeId = jwtService.extractEmployeeId(jwt);

                if (employeeId == null) {
                        throw new RuntimeException("employeeId claim is missing in token");
                }

                return employeeId;
        }

    @GetMapping("/employees/{employeeId}/overview")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING','MANAGER')")
    public ResponseEntity<EmployeePayrollOverviewResponse> getEmployeeOverview(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getEmployeeOverview(employeeId));
    }

    @GetMapping("/employees/{employeeId}/bonuses")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING','MANAGER')")
    public ResponseEntity<java.util.List<Bonus>> getBonuses(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getBonuses(employeeId));
    }

    @GetMapping("/employees/{employeeId}/deductions")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING','MANAGER')")
    public ResponseEntity<java.util.List<Deduction>> getDeductions(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getDeductions(employeeId));
    }

    @GetMapping("/employees/{employeeId}/advances")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING','MANAGER')")
    public ResponseEntity<java.util.List<SalaryAdvance>> getAdvances(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getAdvances(employeeId));
    }

    @GetMapping("/employees/{employeeId}/payrolls")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING','MANAGER')")
    public ResponseEntity<java.util.List<Payroll>> getPayrolls(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getPayrolls(employeeId));
    }

    @GetMapping("/employees/{employeeId}/salaries")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING','MANAGER')")
    public ResponseEntity<java.util.List<Salary>> getSalaries(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getSalaries(employeeId));
    }

        @GetMapping("/me/overview")
        @PreAuthorize("hasRole('EMPLOYEE')")
        public ResponseEntity<EmployeePayrollOverviewResponse> getMyOverview(
                        @RequestHeader("Authorization") String authHeader
        ) {
                return ResponseEntity.ok(payrollService.getEmployeeOverview(extractEmployeeId(authHeader)));
        }

        @GetMapping("/me/bonuses")
        @PreAuthorize("hasRole('EMPLOYEE')")
        public ResponseEntity<java.util.List<Bonus>> getMyBonuses(
                        @RequestHeader("Authorization") String authHeader
        ) {
                return ResponseEntity.ok(payrollService.getBonuses(extractEmployeeId(authHeader)));
        }

        @GetMapping("/me/deductions")
        @PreAuthorize("hasRole('EMPLOYEE')")
        public ResponseEntity<java.util.List<Deduction>> getMyDeductions(
                        @RequestHeader("Authorization") String authHeader
        ) {
                return ResponseEntity.ok(payrollService.getDeductions(extractEmployeeId(authHeader)));
        }

        @GetMapping("/me/advances")
        @PreAuthorize("hasRole('EMPLOYEE')")
        public ResponseEntity<java.util.List<SalaryAdvance>> getMyAdvances(
                        @RequestHeader("Authorization") String authHeader
        ) {
                return ResponseEntity.ok(payrollService.getAdvances(extractEmployeeId(authHeader)));
        }

        @GetMapping("/me/payrolls")
        @PreAuthorize("hasRole('EMPLOYEE')")
        public ResponseEntity<java.util.List<Payroll>> getMyPayrolls(
                        @RequestHeader("Authorization") String authHeader
        ) {
                return ResponseEntity.ok(payrollService.getPayrolls(extractEmployeeId(authHeader)));
        }

        @GetMapping("/advances/pending")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING')")
        public ResponseEntity<java.util.List<SalaryAdvance>> getPendingAdvances() {
                return ResponseEntity.ok(payrollService.getPendingAdvances());
        }

    // 🔥 1. Bordro oluşturma
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING')")
    public ResponseEntity<PayrollResponse> generatePayroll(
            @RequestBody PayrollRequest request
    ) {
        return ResponseEntity.ok(
                payrollService.createPayroll(request)
        );
    }

    // 🔥 2. Bonus ekleme
    @PostMapping("/bonus")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING')")
    public ResponseEntity<Bonus> addBonus(
            @RequestBody Bonus bonus
    ) {
        return ResponseEntity.ok(
                payrollService.addBonus(bonus)
        );
    }

    // 🔥 3. Kesinti ekleme
    @PostMapping("/deduction")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING')")
    public ResponseEntity<Deduction> addDeduction(
            @RequestBody Deduction deduction
    ) {
        return ResponseEntity.ok(
                payrollService.addDeduction(deduction)
        );
    }

    // 🔥 4. Maaş avansı talep
    @PostMapping("/advance")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING','MANAGER','EMPLOYEE')")
    public ResponseEntity<SalaryAdvance> requestAdvance(
                        @RequestHeader(value = "Authorization", required = false) String authHeader,
                        Authentication authentication,
            @RequestBody SalaryAdvance advance
    ) {
                boolean isEmployee = authentication != null && authentication.getAuthorities().stream()
                                .anyMatch(a -> "ROLE_EMPLOYEE".equals(a.getAuthority()));

                if (isEmployee) {
                        advance.setEmployeeId(extractEmployeeId(authHeader));
                }

        return ResponseEntity.ok(
                payrollService.requestAdvance(advance)
        );
    }

    // 🔥 5. Avans onaylama
    @PutMapping("/advance/{id}/approve")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING')")
    public ResponseEntity<SalaryAdvance> approveAdvance(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                payrollService.approveAdvance(id)
        );
    }

    @PutMapping("/advance/{id}/reject")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING')")
    public ResponseEntity<SalaryAdvance> rejectAdvance(
            @PathVariable Long id,
            @RequestBody RejectAdvanceRequest request
    ) {
        return ResponseEntity.ok(payrollService.rejectAdvance(id, request.getReason()));
    }

    // 🔥🔥🔥 6. MAAŞ EKLE
    @PostMapping("/salaries")
        @PreAuthorize("hasAnyRole('SYSTEM_ADMIN','HR_MANAGER','ACCOUNTING')")
    public ResponseEntity<Salary> createSalary(@RequestBody Salary salary) {

        salary.setCreatedAt(LocalDateTime.now());
        salary.setEffectiveDate(LocalDate.now());

        return ResponseEntity.ok(
                salaryRepository.save(salary)
        );
    }
}
