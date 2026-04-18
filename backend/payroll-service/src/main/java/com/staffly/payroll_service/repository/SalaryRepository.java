package com.staffly.payroll_service.repository;

import com.staffly.payroll_service.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

    Optional<Salary> findTopByEmployeeIdOrderByEffectiveDateDesc(Long employeeId);
}