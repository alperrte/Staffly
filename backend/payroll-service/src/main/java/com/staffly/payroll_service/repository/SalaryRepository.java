package com.staffly.payroll_service.repository;

import com.staffly.payroll_service.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

    Optional<Salary> findTopByEmployeeIdOrderByEffectiveDateDescCreatedAtDescIdDesc(Long employeeId);

    List<Salary> findByEmployeeIdOrderByEffectiveDateDescCreatedAtDescIdDesc(Long employeeId);
}
