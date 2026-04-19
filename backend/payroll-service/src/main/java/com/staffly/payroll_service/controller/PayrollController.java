package com.staffly.payroll_service.controller;

import com.staffly.payroll_service.dto.EmployeePayrollOverviewResponse;
import com.staffly.payroll_service.dto.PayrollRequest;
import com.staffly.payroll_service.dto.PayrollResponse;
import com.staffly.payroll_service.entity.*;
import com.staffly.payroll_service.repository.SalaryRepository;
import com.staffly.payroll_service.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/payrolls")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;
    private final SalaryRepository salaryRepository; // 🔥 EKLEDİK

    @GetMapping("/employees/{employeeId}/overview")
    public ResponseEntity<EmployeePayrollOverviewResponse> getEmployeeOverview(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getEmployeeOverview(employeeId));
    }

    @GetMapping("/employees/{employeeId}/bonuses")
    public ResponseEntity<java.util.List<Bonus>> getBonuses(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getBonuses(employeeId));
    }

    @GetMapping("/employees/{employeeId}/deductions")
    public ResponseEntity<java.util.List<Deduction>> getDeductions(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getDeductions(employeeId));
    }

    @GetMapping("/employees/{employeeId}/advances")
    public ResponseEntity<java.util.List<SalaryAdvance>> getAdvances(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getAdvances(employeeId));
    }

    @GetMapping("/employees/{employeeId}/payrolls")
    public ResponseEntity<java.util.List<Payroll>> getPayrolls(
            @PathVariable Long employeeId
    ) {
        return ResponseEntity.ok(payrollService.getPayrolls(employeeId));
    }

    // 🔥 1. Bordro oluşturma
    @PostMapping("/generate")
    public ResponseEntity<PayrollResponse> generatePayroll(
            @RequestBody PayrollRequest request
    ) {
        return ResponseEntity.ok(
                payrollService.createPayroll(request)
        );
    }

    // 🔥 2. Bonus ekleme
    @PostMapping("/bonus")
    public ResponseEntity<Bonus> addBonus(
            @RequestBody Bonus bonus
    ) {
        return ResponseEntity.ok(
                payrollService.addBonus(bonus)
        );
    }

    // 🔥 3. Kesinti ekleme
    @PostMapping("/deduction")
    public ResponseEntity<Deduction> addDeduction(
            @RequestBody Deduction deduction
    ) {
        return ResponseEntity.ok(
                payrollService.addDeduction(deduction)
        );
    }

    // 🔥 4. Maaş avansı talep
    @PostMapping("/advance")
    public ResponseEntity<SalaryAdvance> requestAdvance(
            @RequestBody SalaryAdvance advance
    ) {
        return ResponseEntity.ok(
                payrollService.requestAdvance(advance)
        );
    }

    // 🔥 5. Avans onaylama
    @PutMapping("/advance/{id}/approve")
    public ResponseEntity<SalaryAdvance> approveAdvance(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                payrollService.approveAdvance(id)
        );
    }

    // 🔥🔥🔥 6. MAAŞ EKLE
    @PostMapping("/salaries")
    public ResponseEntity<Salary> createSalary(@RequestBody Salary salary) {

        salary.setCreatedAt(LocalDateTime.now());
        salary.setEffectiveDate(LocalDate.now());

        return ResponseEntity.ok(
                salaryRepository.save(salary)
        );
    }
}