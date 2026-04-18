package com.staffly.payroll_service.repository;

import com.staffly.payroll_service.entity.Deduction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface DeductionRepository extends JpaRepository<Deduction, Long> {

    long countByEmployeeId(Long employeeId);

    List<Deduction> findByEmployeeIdAndCreatedAtBetween(
            Long employeeId,
            LocalDateTime start,
            LocalDateTime end
    );
}