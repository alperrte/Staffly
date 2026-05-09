package com.staffly.payroll_service.service;

import com.staffly.payroll_service.dto.EmployeePayrollOverviewResponse;
import com.staffly.payroll_service.dto.PayrollRequest;
import com.staffly.payroll_service.dto.PayrollResponse;
import com.staffly.payroll_service.entity.*;
import com.staffly.payroll_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final SalaryRepository salaryRepository;
    private final BonusRepository bonusRepository;
    private final DeductionRepository deductionRepository;
    private final PayrollRepository payrollRepository;
    private final SalaryAdvanceRepository salaryAdvanceRepository;

    public EmployeePayrollOverviewResponse getEmployeeOverview(Long employeeId) {

        Salary salary = salaryRepository
                .findTopByEmployeeIdOrderByEffectiveDateDesc(employeeId)
                .orElse(null);

        Payroll lastPayroll = payrollRepository
                .findFirstByEmployeeIdOrderByYearDescMonthDesc(employeeId)
                .orElse(null);

        long payrollCount = payrollRepository.countByEmployeeId(employeeId);
        long bonusCount = bonusRepository.countByEmployeeId(employeeId);
        long deductionCount = deductionRepository.countByEmployeeId(employeeId);
        long pendingAdv = salaryAdvanceRepository
            .countByEmployeeIdAndApprovedIsFalseAndRejectionReasonIsNull(employeeId);
        long approvedAdv = salaryAdvanceRepository.countByEmployeeIdAndApprovedIsTrue(employeeId);

        return EmployeePayrollOverviewResponse.from(
                lastPayroll,
                salary,
                payrollCount,
                bonusCount,
                deductionCount,
                pendingAdv,
                approvedAdv
        );
    }

    public java.util.List<Bonus> getBonuses(Long employeeId) {
        return bonusRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public java.util.List<Deduction> getDeductions(Long employeeId) {
        return deductionRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public java.util.List<SalaryAdvance> getAdvances(Long employeeId) {
        return salaryAdvanceRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public java.util.List<Payroll> getPayrolls(Long employeeId) {
        return payrollRepository.findByEmployeeIdOrderByYearDescMonthDescCreatedAtDesc(employeeId);
    }

    public PayrollResponse createPayroll(PayrollRequest request) {

        Long employeeId = request.getEmployeeId();
        int month = request.getMonth();
        int year = request.getYear();

        // 🔥 DUPLICATE KONTROL
        if (payrollRepository.existsByEmployeeIdAndMonthAndYear(employeeId, month, year)) {
            throw new RuntimeException("Payroll already exists for this month");
        }

        // 🔥 AY ARALIĞI
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);

        // 🔥 salary çek
        Salary salary = salaryRepository
                .findTopByEmployeeIdOrderByEffectiveDateDesc(employeeId)
                .orElseThrow(() -> new RuntimeException("Salary not found"));

        BigDecimal base = salary.getBaseSalary();

        // 🔥 SADECE O AYIN BONUSLARI
        BigDecimal totalBonus = bonusRepository
                .findByEmployeeIdAndCreatedAtBetween(employeeId, start, end)
                .stream()
                .map(Bonus::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔥 SADECE O AYIN KESİNTİLERİ
        BigDecimal totalDeduction = deductionRepository
                .findByEmployeeIdAndCreatedAtBetween(employeeId, start, end)
                .stream()
                .map(Deduction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔥 SADECE O AYIN ONAYLI AVANSLARI
        BigDecimal totalAdvance = salaryAdvanceRepository
                .findByEmployeeIdAndApprovedTrueAndCreatedAtBetween(employeeId, start, end)
                .stream()
                .map(SalaryAdvance::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 🔥 NET MAAŞ
        BigDecimal net = base
                .add(totalBonus)
                .subtract(totalDeduction)
                .subtract(totalAdvance);

        // 🔥 entity oluştur
        Payroll payroll = Payroll.builder()
                .employeeId(employeeId)
                .month(month)
                .year(year)
                .baseSalary(base)
                .totalBonus(totalBonus)
                .totalDeduction(totalDeduction)
                .netSalary(net)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        payrollRepository.save(payroll);

        // 🔥 response
        return PayrollResponse.builder()
                .employeeId(employeeId)
                .month(month)
                .year(year)
                .baseSalary(base)
                .totalBonus(totalBonus)
                .totalDeduction(totalDeduction)
                .netSalary(net)
                .status("PENDING")
                .build();
    }

    // 🔥 BONUS EKLE
    public Bonus addBonus(Bonus bonus) {
        bonus.setCreatedAt(LocalDateTime.now());
        return bonusRepository.save(bonus);
    }

    // 🔥 KESİNTİ EKLE
    public Deduction addDeduction(Deduction deduction) {
        deduction.setCreatedAt(LocalDateTime.now());
        return deductionRepository.save(deduction);
    }

    // 🔥 AVANS TALEP
    public SalaryAdvance requestAdvance(SalaryAdvance advance) {
        advance.setApproved(false);
        advance.setRejectionReason(null);
        advance.setReviewedAt(null);
        advance.setCreatedAt(LocalDateTime.now());
        return salaryAdvanceRepository.save(advance);
    }

    // 🔥 AVANS ONAY
    public SalaryAdvance approveAdvance(Long id) {

        SalaryAdvance advance = salaryAdvanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advance not found"));

        advance.setApproved(true);
        advance.setRejectionReason(null);
        advance.setReviewedAt(LocalDateTime.now());

        return salaryAdvanceRepository.save(advance);
    }

    public SalaryAdvance rejectAdvance(Long id, String reason) {

        if (reason == null || reason.trim().isEmpty()) {
            throw new RuntimeException("Rejection reason is required");
        }

        SalaryAdvance advance = salaryAdvanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advance not found"));

        advance.setApproved(false);
        advance.setRejectionReason(reason.trim());
        advance.setReviewedAt(LocalDateTime.now());

        return salaryAdvanceRepository.save(advance);
    }

    public java.util.List<SalaryAdvance> getPendingAdvances() {
        return salaryAdvanceRepository
                .findByApprovedIsFalseAndRejectionReasonIsNullOrderByCreatedAtDesc();
    }
}