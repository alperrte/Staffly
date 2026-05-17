package com.staffly.payroll_service.repository;

import com.staffly.payroll_service.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    // 🔥 aynı dönem bordrosunu bul
    Optional<Payroll> findByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);

    // 🔥 geçmiş payrolllar
    List<Payroll> findByEmployeeId(Long employeeId);
    List<Payroll> findByEmployeeIdOrderByYearDescMonthDescCreatedAtDesc(Long employeeId);

    long countByEmployeeId(Long employeeId);

    Optional<Payroll> findFirstByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);
}
