package com.staffly.payroll_service.repository;

import com.staffly.payroll_service.entity.SalaryAdvance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SalaryAdvanceRepository extends JpaRepository<SalaryAdvance, Long> {

    long countByEmployeeIdAndApprovedIsFalse(Long employeeId);

    long countByEmployeeIdAndApprovedIsTrue(Long employeeId);

    List<SalaryAdvance> findByEmployeeIdAndApprovedTrueAndCreatedAtBetween(
            Long employeeId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<SalaryAdvance> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}